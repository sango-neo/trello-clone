export interface ColumnInterface {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

//Note how the interface / structure of a column on the front end takes the date fields as strings, while backend structure of a column has them as Date types