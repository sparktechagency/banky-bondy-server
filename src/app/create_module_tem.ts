/* eslint-disable no-undef */
import fs from 'fs';
import path from 'path';

// Function to create module folder and files inside a given profile folder
function createModule(profileName: string, moduleName: string): void {
    const baseDir = path.join(__dirname, profileName);
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir);
    }

    const moduleDir = path.join(baseDir, moduleName);
    if (!fs.existsSync(moduleDir)) {
        fs.mkdirSync(moduleDir);
    }
    const files: string[] = [
        `${moduleName}.interface.ts`,
        `${moduleName}.routes.ts`,
        `${moduleName}.model.ts`,
        `${moduleName}.controller.ts`,
        `${moduleName}.service.ts`,
        `${moduleName}.validation.ts`,
    ];

    const defaultContents: Record<string, string> = {
        [`${moduleName}.interface.ts`]: `import { Types } from "mongoose";

export interface I${capitalize(moduleName)} {
    user: Types.ObjectId;
    name: string;
    username?: string;
    phone?: string;
    email: string;
    address?: string;
    profile_image?: string;
    totalAmount?: number;
    totalPoint?: number;
}`,

        [`${moduleName}.routes.ts`]: `import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constant";
import validateRequest from "../../middlewares/validateRequest";
import ${moduleName}Validations from "./${moduleName}.validation";
import ${moduleName}Controller from "./${moduleName}.controller";
import { uploadFile } from "../../helper/fileUploader";

const router = express.Router();

router.patch(
    "/update-profile",
    auth(USER_ROLE.user),
    uploadFile(),
    (req, res, next) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(${moduleName}Validations.update${capitalize(
        moduleName
    )}Data),
    ${moduleName}Controller.updateUserProfile
);

export const ${moduleName}Routes = router;`,

        [`${moduleName}.model.ts`]: `import { model, Schema } from "mongoose";
import { I${capitalize(moduleName)} } from "./${moduleName}.interface";

const ${moduleName}Schema = new Schema<I${capitalize(moduleName)}>({
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    address: { type: String },
    profile_image: { type: String, default: "" },
    totalAmount: { type: Number, default: 0 },
    totalPoint: { type: Number, default: 0 }
}, { timestamps: true });

const ${moduleName}Model = model<I${capitalize(moduleName)}>("${capitalize(
            moduleName
        )}", ${moduleName}Schema);
export default ${moduleName}Model;`,

        [`${moduleName}.controller.ts`]: `import httpStatus from "http-status";
import catchAsync from "../../utilities/catchasync";
import sendResponse from "../../utilities/sendResponse";
import ${moduleName}Services from "./${moduleName}.service";

const updateUserProfile = catchAsync(async (req, res) => {
    const { files } = req;
    if (files && typeof files === "object" && "profile_image" in files) {
        req.body.profile_image = files["profile_image"][0].path;
    }
    const result = await ${moduleName}Services.updateUserProfile(
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});

const ${capitalize(moduleName)}Controller = { updateUserProfile };
export default ${capitalize(moduleName)}Controller;`,

        [`${moduleName}.service.ts`]: `import httpStatus from "http-status";
import AppError from "../../error/appError";
import { I${capitalize(moduleName)} } from "./${moduleName}.interface";
import ${moduleName}Model from "./${moduleName}.model";

const updateUserProfile = async (id: string, payload: Partial<I${capitalize(
            moduleName
        )}>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await ${moduleName}Model.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await ${moduleName}Model.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const ${capitalize(moduleName)}Services = { updateUserProfile };
export default ${capitalize(moduleName)}Services;`,

        [`${moduleName}.validation.ts`]: `import { z } from "zod";

export const update${capitalize(moduleName)}Data = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const ${capitalize(moduleName)}Validations = { update${capitalize(
            moduleName
        )}Data };
export default ${capitalize(moduleName)}Validations;`,
    };

    files.forEach((file) => {
        const filePath = path.join(moduleDir, file);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, defaultContents[file], 'utf8');
        }
    });

    console.log(
        `Module '${moduleName}' created successfully inside '${profileName}'.`
    );
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const args: string[] = process.argv.slice(2);
if (args.length !== 2) {
    console.log('Usage: ts-node script.ts <profileName> <moduleName>');
    process.exit(1);
}

const profileName: string = args[0];
const moduleName: string = args[1];
createModule(profileName, moduleName);
