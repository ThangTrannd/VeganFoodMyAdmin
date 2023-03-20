declare module 'express-session' {
    interface SessionData {
        userid: string
    }
}
declare namespace NodeJS {
    interface ProcessEnv {
        ADMIN_USERNAME: string
    }
}

declare global {
    interface MySQLResult {
        fieldCount?: number,
        affectedRows?: number,
        insertId?: number,
        info?: string,
        serverStatus?: number,
        warningStatus?: number,
        changedRows?: number,
    }

    interface JWTPayload {
        id : number,
        username : string,
        password : string,
        iat : number
    }
}


export {}
