import { Schema, model } from 'mongoose';
import { ISkill } from './skill.interface';

const skillSchema = new Schema<ISkill>(
    {
        name: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

const Skill = model<ISkill>('Skill', skillSchema);

export { Skill };
