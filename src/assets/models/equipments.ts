export interface IEquipment {
    id: EquipmentID,
    category: string,
    name: string,
    brand: string,
    model: string,
    imgUrl: string,
    filesUrl: string,
    isUsing?: string[],
    isOperate?: boolean,
    userID?: UserID
}

export type TEquipmentID = string
export type TUserID = string

export interface IEquipmentsByCategories {
    [key: string]: IEquipment[]
}