import { ENUM_TEST_TYPE } from '../../utilities/enum';

export interface ICategory {
    name: string;
    category_image: string;
    testType: (typeof ENUM_TEST_TYPE)[keyof typeof ENUM_TEST_TYPE];
    isDeleted: boolean;
}
