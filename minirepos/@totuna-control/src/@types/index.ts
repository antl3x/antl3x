export interface PrivilegesTableColumns {
  [tableName: string]: {
    [columnName: string]: {
      [roleName: string]: string[];
    };
  };
}

export interface PrivilegesTables {
  [tableName: string]: {
    [roleName: string]: string[];
  };
}
