import httpStatus from 'http-status';
import AppError from '../../error/appError';
import QueryBuilder from '../../builder/QueryBuilder';
import { ISkill } from './skill.interface';
import { Skill } from './skill.model';

// Create Topic
const createSkill = async (payload: ISkill) => {
    const result = await Skill.create(payload);
    return result;
};

// Get All Topics
const getAllSkill = async (query: Record<string, unknown>) => {
    const skillQuery = new QueryBuilder(Skill.find(), query)
        .search(['name'])
        .fields()
        .filter()
        .paginate()
        .sort();

    const result = await skillQuery.modelQuery;
    const meta = await skillQuery.countTotal();
    return {
        meta,
        result,
    };
};

// Get Topic by ID
const getSkillById = async (skillId: string) => {
    const topic = await Skill.findById(skillId);
    if (!topic) {
        throw new AppError(httpStatus.NOT_FOUND, 'Topic not found');
    }
    return topic;
};

// Update Topic
const updateSkill = async (skillId: string, payload: ISkill) => {
    const skill = await Skill.findById(skillId);
    if (!skill) {
        throw new AppError(httpStatus.NOT_FOUND, 'Skill not found');
    }

    const updatedTopic = await Skill.findByIdAndUpdate(
        skillId,
        { ...payload },
        { new: true }
    );

    return updatedTopic;
};

// Delete Topic
const deleteTopic = async (skillId: string) => {
    const skill = await Skill.findById(skillId);
    if (!skill) {
        throw new AppError(httpStatus.NOT_FOUND, 'Topic not found');
    }
    const result = await Skill.findByIdAndDelete(skillId);

    return result;
};

const SkillServices = {
    createSkill,
    getAllSkill,
    getSkillById,
    updateSkill,
    deleteTopic,
};

export default SkillServices;
