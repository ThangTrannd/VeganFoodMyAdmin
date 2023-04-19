"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyIncome = exports.getYearlyChart = exports.getRangeBarChart = exports.getMonthlyChart = exports.getAllStatistical = void 0;
const pg_1 = require("pg");
const posgre_1 = require("../config/posgre");
const index_1 = require("./index");
const date_fns_1 = require("date-fns");
async function getAllStatistical() {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const queryResult = await connection.query(`select *
                                                    from "OrderDetail"
                                                            inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid`);
        const result = {
            total: queryResult.rows.length,
            pending: 0,
            completed: 0,
            canceled: 0,
            delivering: 0
        };
        queryResult.rows.forEach(item => {
            if (item.status == "Đợi xác nhận")
                result.pending++;
            else if (item.status == "Hoàn thành")
                result.completed++;
            else if (item.status == "Đang giao")
                result.delivering++;
            else
                result.canceled++;
        });
        return (0, index_1.createResult)(result);
    }
    catch (e) {
        return (0, index_1.createException)("Khong the load thong ke!");
    }
}
exports.getAllStatistical = getAllStatistical;
async function getMonthlyChart() {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    const result = {
        xAxis: [],
        data: []
    };
    const dateInstance = new Date();
    const daysInMonth = new Date(dateInstance.getFullYear(), dateInstance.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (0, date_fns_1.format)(new Date(dateInstance.getFullYear(), dateInstance.getMonth(), 1), "MM-dd-yyyy, HH:mm:ss a");
    const lastDayOfMonth = (0, date_fns_1.format)(new Date(dateInstance.getFullYear(), dateInstance.getMonth() + 1, 0), "MM-dd-yyyy, HH:mm:ss a");
    const today = dateInstance.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        result.xAxis.push(i);
    }
    let total = 0;
    const orderData = await connection.query(`select *
                                            from "OrderDetail"
                                                    inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                            where status like 'Hoàn thành'
                                              and PD.modifiedat >= '${firstDayOfMonth}'
                                              and PD.modifiedat <= '${lastDayOfMonth}'`);
    for (let i = 1; i <= today; i++) {
        const day = new Date(dateInstance.getFullYear(), dateInstance.getMonth(), i + 1);
        const findResult = orderData.rows.filter(item => new Date(item.modifiedat).getDate() == day.getDate());
        if (findResult == undefined || findResult.length == 0) {
            result.data.push(total);
        }
        else {
            findResult.forEach(item => total += Number(item.total));
            result.data.push(total);
        }
    }
    return result;
}
exports.getMonthlyChart = getMonthlyChart;
async function getRangeBarChart() {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    const orderData = await connection.query(`select to_char(PD.modifiedat::date, 'DD-MM-YYYY') as date,
                                                  round(sum(total))                          as total
                                            from "OrderDetail"
                                                    inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                            where status like 'Hoàn thành'
                                            group by to_char(PD.modifiedat::date, 'DD-MM-YYYY') order by date`);
    const result = { labels: [], data: [] };
    await orderData.rows.forEach((item) => {
        result.labels.push(item.date);
        result.data.push(item.total);
    });
    return result;
}
exports.getRangeBarChart = getRangeBarChart;
async function getYearlyChart() {
    const result = {
        xAxis: [],
        data: []
    };
    for (let i = 1; i <= 12; i++) {
        result.xAxis.push(i);
    }
    const promises = [];
    for (let i = 0; i < 12; i++) {
        promises.push(getMonthlyIncome(i));
    }
    const promisesResult = await Promise.all(promises);
    promisesResult.forEach(item => result.data.push(item));
    return result;
}
exports.getYearlyChart = getYearlyChart;
async function getMonthlyIncome(month) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    const dateInstance = new Date();
    const daysInMonth = new Date(dateInstance.getFullYear(), month + 1, 0).getDate();
    const firstDayOfMonth = (0, date_fns_1.format)(new Date(dateInstance.getFullYear(), month, 1), "MM-dd-yyyy, HH:mm:ss a");
    const lastDayOfMonth = (0, date_fns_1.format)(new Date(dateInstance.getFullYear(), month + 1, 0), "MM-dd-yyyy, HH:mm:ss a");
    // let firstDayOfMonth = new Date(dateInstance.getFullYear(), month, 1).toLocaleString("en-US")
    // let lastDayOfMonth = new Date(dateInstance.getFullYear(), month + 1, 0).toLocaleString("en-US")
    let total = 0;
    const orderData = await connection.query(`select *
                                            from "OrderDetail"
                                                    inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                            where status like 'Hoàn thành'
                                              and PD.modifiedat >= '${firstDayOfMonth}'
                                              and PD.modifiedat <= '${lastDayOfMonth}'`);
    for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(dateInstance.getFullYear(), dateInstance.getMonth(), i + 1);
        const findResult = orderData.rows.filter(item => new Date(item.modifiedat).getDate() == day.getDate());
        if (findResult == undefined || findResult.length == 0) { /* empty */
        }
        else {
            findResult.forEach(item => total += Number(item.total));
        }
    }
    return total;
}
exports.getMonthlyIncome = getMonthlyIncome;
