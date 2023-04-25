import {Pool} from "pg";
import {PostgreSQLConfig} from "../config/posgre";
import {createException, createResult} from "./index";
import {format} from "date-fns";

export async function getAllStatistical(): Promise<APIResponse<any>> {
    try {
        const connection = await new Pool(PostgreSQLConfig);
        const queryResult = await connection.query(`select *
                                                    from "OrderDetail"
                                                            inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid`);
        const test = await connection.query(`select PD."status", count(PD."status") from "OrderDetail"inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid group by (PD."status")`);
        console.log(test)
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
        return createResult(result);
    } catch (e) {
        return createException("Khong the load thong ke!");
    }
}


export async function getMonthlyChart(): Promise<any> {
    const connection = await new Pool(PostgreSQLConfig);
    const result: { xAxis: number[], data: number[] } = {
        xAxis: [],
        data: []
    };
    const dateInstance = new Date();
    const daysInMonth = new Date(dateInstance.getFullYear(), dateInstance.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = format(new Date(dateInstance.getFullYear(), dateInstance.getMonth(), 1), "MM-dd-yyyy, HH:mm:ss a");
    const lastDayOfMonth = format(new Date(dateInstance.getFullYear(), dateInstance.getMonth() + 1, 0), "MM-dd-yyyy, HH:mm:ss a");
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
        } else {
            findResult.forEach(item => total += Number(item.total));
            result.data.push(total);
        }
    }
    return result;
}

export async function getRangeBarChart(): Promise<any> {
    const connection = await new Pool(PostgreSQLConfig);

    const orderData = await connection.query(`select to_char(PD.modifiedat::date, 'DD-MM-YYYY') as date,
                                                  round(sum(total))                          as total
                                            from "OrderDetail"
                                                    inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                            where status like 'Hoàn thành'
                                            group by to_char(PD.modifiedat::date, 'DD-MM-YYYY') order by date`);
    const result: { labels: string[], data: string[] } = {labels: [], data: []};
    await orderData.rows.forEach((item: any) => {
        result.labels.push(item.date);
        result.data.push(item.total);
    });
    return result;
}

export async function getYearlyChart(): Promise<any> {
    const result: { xAxis: number[], data: number[] } = {
        xAxis: [],
        data: []
    };
    for (let i = 1; i <= 12; i++) {
        result.xAxis.push(i);
    }
    const promises: Promise<any>[] = [];
    for (let i = 0; i < 12; i++) {
        promises.push(getMonthlyIncome(i));
    }
    const promisesResult = await Promise.all(promises);
    promisesResult.forEach(item => result.data.push(item));
    return result;
}

export async function getMonthlyIncome(month: number): Promise<number> {
    const connection = await new Pool(PostgreSQLConfig);
    const dateInstance = new Date();
    const daysInMonth = new Date(dateInstance.getFullYear(), month + 1, 0).getDate();
    const firstDayOfMonth = format(new Date(dateInstance.getFullYear(), month, 1), "MM-dd-yyyy, HH:mm:ss a");
    const lastDayOfMonth = format(new Date(dateInstance.getFullYear(), month + 1, 0), "MM-dd-yyyy, HH:mm:ss a");
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
        } else {
            findResult.forEach(item => total += Number(item.total));
        }
    }
    return total;
}
