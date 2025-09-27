import { model, Schema } from 'mongoose';
import { ICategory } from './category.interface';
import { ENUM_TEST_TYPE } from '../../utilities/enum';

const CategorySchema: Schema = new Schema<ICategory>(
    {
        name: { type: String, required: true },
        category_image: { type: String, required: true },
        testType: {
            type: String,
            enum: Object.values(ENUM_TEST_TYPE),
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Category = model<ICategory>('Category', CategorySchema);

export default Category;
