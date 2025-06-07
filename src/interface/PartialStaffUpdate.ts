export interface PartialStaffUpdate {
    id: number;
    username: string;
    email: string;
    date_of_birth: string;
    picture?: number;  // 上传的图片 ID，可选
}