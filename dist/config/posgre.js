"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSQLConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: "process.env"
});
const isProduction = process.env.PRODUCTION === "true";
console.log(process.env.PRODUCTION);
const productionConf = {
    connectionString: "postgres://hieu:ISUhPDo15lS1x955YwlCimtAE3cvhlOC@dpg-cfctgjsgqg43t5g62lug-a/veganfood"
};
const nonProductionConf = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // ssl : true
    // ssl: {
    //     rejectUnauthorized: false,
    //     cert: fs.readFileSync('./cert.pem').toString(),
    //     key: fs.readFileSync('./key.pem').toString(),
    // },
    query_timeout: 0,
    connectionTimeoutMillis: 0,
};
exports.PostgreSQLConfig = nonProductionConf;
