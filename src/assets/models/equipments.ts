export interface IEquipment {
    id: TEquipmentID,
    category: string,
    name: string,
    brand: string,
    model: string,
    imgUrl: string,
    filesUrl: string,
    isUsing?: string[],
    isOperate?: boolean,
    userID?: TUserID
}

export type TEquipmentID = string
export type TUserID = string

export interface IEquipmentsByCategories {
    [key: string]: IEquipment[]
}