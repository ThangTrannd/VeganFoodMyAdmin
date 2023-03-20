"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyIncome = exports.getYearlyChart = exports.getRangeBarChart = exports.getMonthlyChart = exports.getAllStatistical = void 0;
const pg_1 = require("pg");
const posgre_1 = require("../config/posgre");
const index_1 = require("./index");
async function getAllStatistical() {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const queryResult = await connection.query(`select *
                                                    from "OrderDetail"
                                                             inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid`);
        let result = {
            total: queryResult.rows.length,
            pending: 0,
            completed: 0,
            canceled: 0,
            delivering: 0
        };
        queryResult.rows.forEach(item => {
            if (item.status == 'Đợi xác nhận')
                result.pending++;
            else if (item.status == 'Hoàn thành')
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
    let result = {
        xAxis: [],
        data: []
    };
    let dateInstance = new Date();
    let daysInMonth = new Date(dateInstance.getFullYear(), dateInstance.getMonth() + 1, 0).getDate();
    let firstDayOfMonth = new Date(dateInstance.getFullYear(), dateInstance.getMonth(), 1).toLocaleString("en-US");
    let lastDayOfMonth = new Date(dateInstance.getFullYear(), dateInstance.getMonth() + 1, 0).toLocaleString("en-US");
    let today = dateInstance.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        result.xAxis.push(i);
    }
    let total = 0;
    let orderData = await connection.query(`select *
                                            from "OrderDetail"
                                                     inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                            where status like 'Hoàn thành'
                                              and PD.modifiedat >= '${firstDayOfMonth}'
                                              and PD.modifiedat <= '${lastDayOfMonth}'`);
    for (let i = 1; i <= today; i++) {
        let day = new Date(dateInstance.getFullYear(), dateInstance.getMonth(), i + 1);
        let findResult = orderData.rows.filter(item => new Date(item.modifiedat).getDate() == day.getDate());
        if (findResult == undefined || findResult.length == 0) {
            result.data.push(total);
        }
        else {
            findResult.forEach(item => total += Number(item.total));
            result.data.push(total);
        }
    }
    console.log("Month: ", result);
    return result;
}
exports.getMonthlyChart = getMonthlyChart;
async function getRangeBarChart() {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    let orderData = await connection.query(`select to_char(PD.modifiedat::date, 'DD-MM-YYYY') as date,
                                                   round(sum(total))                          as total
                                            from "OrderDetail"
                                                     inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                            where status like 'Hoàn thành'
                                            group by to_char(PD.modifiedat::date, 'DD-MM-YYYY') order by date`);
    let result = {
        labels: [],
        data: []
    };
    await orderData.rows.forEach((item) => {
        // @ts-ignore
        result.labels.push(item.date);
        // @ts-ignore
        result.data.push(item.total);
    });
    // @ts-ignore
    return result;
}
exports.getRangeBarChart = getRangeBarChart;
async function getYearlyChart() {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    let result = {
        xAxis: [],
        data: []
    };
    for (let i = 1; i <= 12; i++) {
        result.xAxis.push(i);
    }
    let promises = [];
    for (let i = 0; i < 12; i++) {
        promises.push(getMonthlyIncome(i));
    }
    let promisesResult = await Promise.all(promises);
    promisesResult.forEach(item => result.data.push(item));
    console.log("Year: ", result);
    return result;
}
exports.getYearlyChart = getYearlyChart;
async function getMonthlyIncome(month) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    let dateInstance = new Date();
    let daysInMonth = new Date(dateInstance.getFullYear(), month + 1, 0).getDate();
    let firstDayOfMonth = new Date(dateInstance.getFullYear(), month, 1).toLocaleString("en-US");
    let lastDayOfMonth = new Date(dateInstance.getFullYear(), month + 1, 0).toLocaleString("en-US");
    let total = 0;
    let orderData = await connection.query(`select *
                                            from "OrderDetail"
                                                     inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                            where status like 'Hoàn thành'
                                              and PD.modifiedat >= '${firstDayOfMonth}'
                                              and PD.modifiedat <= '${lastDayOfMonth}'`);
    for (let i = 1; i <= daysInMonth; i++) {
        let day = new Date(dateInstance.getFullYear(), dateInstance.getMonth(), i + 1);
        let findResult = orderData.rows.filter(item => new Date(item.modifiedat).getDate() == day.getDate());
        if (findResult == undefined || findResult.length == 0) {
        }
        else {
            findResult.forEach(item => total += Number(item.total));
        }
    }
    return total;
}
exports.getMonthlyIncome = getMonthlyIncome;
exports.default = {};
