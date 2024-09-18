import * as xl from "excel4node";
import * as XLSX from "xlsx";
import { dateFormat } from "./dateFormat";

export interface ExcelHeader {
  label: string;
  name: string;
  type: string;
  width: number;
}

export const EXCEL_HEADER_STYLE = {
  alignment: {
    horizontal: "center",
    vertical: "center",
  },
  font: {
    bold: true,
    color: "000000",
    size: 14,
  },
  border: {
    left: {
      style: "thin",
      color: "424242",
    },
    right: {
      style: "thin",
      color: "424242",
    },
    top: {
      style: "thin",
      color: "424242",
    },
    bottom: {
      style: "thin",
      color: "424242",
    },
  },
  fill: {
    type: "pattern",
    patternType: "solid",
    bgColor: "D0A9F5",
    fgColor: "D0A9F5",
  },
};

export const EXCEL_DATA_STYLE = {
  alignment: {
    horizontal: "center",
    vertical: "center",
  },
  border: {
    left: {
      style: "thin",
      color: "424242",
    },
    right: {
      style: "thin",
      color: "424242",
    },
    top: {
      style: "thin",
      color: "424242",
    },
    bottom: {
      style: "thin",
      color: "424242",
    },
  },
};

export const EXCEL_NUMBER_STYLE = {
  alignment: {
    horizontal: "right",
    vertical: "center",
  },
  border: {
    left: {
      style: "thin",
      color: "424242",
    },
    right: {
      style: "thin",
      color: "424242",
    },
    top: {
      style: "thin",
      color: "424242",
    },
    bottom: {
      style: "thin",
      color: "424242",
    },
  },
  numberFormat: "#,###; (#,###); -",
};

const convertValue2Type = (type: string, value: any) => {
  if (type === "string") {
    return value ? String(value) : "";
  } else if (type === "number") {
    return value ? Number(value) : 0;
  } else if (type === "date") {
    try {
      if (typeof value === "string") {
        return new Date(Date.parse(value));
      } else if (typeof value === "number") {
        return new Date(value);
      } else {
        return new Date();
      }
    } catch (_) {
      return new Date();
    }
  }

  return null;
};

export const array2jons = (scheme: any, path: string) => {
  const {
    read,
    utils: { sheet_to_json },
  } = XLSX;

  const wb: XLSX.WorkBook = read(path, { type: "file", cellDates: true });
  const ws: XLSX.WorkSheet = wb.Sheets[wb.SheetNames[0]];

  const datas = sheet_to_json<Array<any>>(ws, { header: 1, raw: true });

  if (!datas || datas.length === 0) {
    return null;
  }

  let headerRowIndex = -1;
  let headerRow: Array<any> | null = null;
  for (let i = 0; i < datas.length; i++) {
    const data: any = datas[i];

    let isFind = true;
    for (const key in scheme) {
      if (data.indexOf(key) < 0) {
        isFind = false;
        break;
      }
    }

    if (isFind) {
      headerRow = data;
      headerRowIndex = i;
      break;
    }
  }

  if (!headerRow) {
    return null;
  }

  const newScheme: any = [];
  // tslint:disable-next-line:forin
  for (const key in scheme) {
    const c = scheme[key];
    const index = headerRow.indexOf(key);
    newScheme.push({
      name: c.name,
      type: c.type,
      index,
    });
  }

  const res: Array<any> = new Array<any>();
  for (let i = headerRowIndex + 1; i < datas.length; i++) {
    const row = datas[i];
    const newData: any = {};
    for (let j = 0; j < newScheme.length; j++) {
      const ns = newScheme[j];
      newData[ns.name] = convertValue2Type(ns.type, row[ns.index]);
    }

    res.push(newData);
  }

  return res;
};

const createWorkbook = (headers: any[], datas: any[]) => {
  const wb = new xl.Workbook({
    defaultFont: {
      size: 14,
      name: "Calibri",
      color: "000000",
    },
    dateFormat: "yyyy-mm-dd hh:mm:ss",
    numberFormat: "#,###; -",
  });

  // header style
  const hstyle = wb.createStyle(EXCEL_HEADER_STYLE);

  const dstyle = wb.createStyle(EXCEL_DATA_STYLE);

  const numberStyle = wb.createStyle(EXCEL_NUMBER_STYLE);

  const ws = wb.addWorksheet(dateFormat(new Date(), "yyyy-MM-dd"));

  let cr = 1;
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    ws.cell(cr, i + 1)
      .string(header.label)
      .style(hstyle);

    if (header.width) {
      ws.column(i + 1).setWidth(header.width);
    }
  }
  cr++;

  for (let r = 0; r < datas.length; r++, cr++) {
    const cells = datas[r];
    for (let h = 0; h < headers.length; h++) {
      const header = headers[h];
      const stl = header.type === "number" ? numberStyle : dstyle;

      const cell = ws.cell(cr, h + 1);
      cell.style(stl);

      const data = cells[header.name];
      if (!data) {
        continue;
      }

      if (header.type === "string") {
        cell.string(data);
      } else if (header.type === "number") {
        cell.number(data);
      } else if (header.type === "date") {
        cell.date(data);
      } else if (header.type === "bool") {
        cell.bool(data);
      } else {
        cell.string(data);
      }
    }
  }

  return wb;
};

export const creaetExcelFile = (
  filename: string,
  headers: any[],
  datas: any[]
) => {
  try {
    const wb = createWorkbook(headers, datas);
    wb.write(filename);
  } catch (error) {
    console.error("createExcel failed!!", error);
  }
};

export const creaetExcel = (headers: any[], datas: any[]) => {
  try {
    const wb = createWorkbook(headers, datas);
    return wb.writeToBuffer();
  } catch (error) {
    console.error("createExcel failed!!", error);
    return null;
  }
};

export const creaetExcelForExpress = async (
  res: any,
  filename: string,
  headers: any[],
  datas: any[]
) => {
  try {
    const wb = createWorkbook(headers, datas);
    // wb.write(filename, res);
    const buffer = await wb.writeToBuffer();

    res.writeHead(200, {
      "Content-Length": buffer.length,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(
        filename
      )}"; filename*=utf-8''${encodeURIComponent(filename)};`,
    });

    res.end(buffer);
  } catch (error) {
    console.error("createExcel failed!!", error);
  }
};
