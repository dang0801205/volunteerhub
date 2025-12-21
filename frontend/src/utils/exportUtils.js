/** @format */

export const exportToCSV = (data, filename) => {
  if (!data || !data.length) {
    alert("Không có dữ liệu để xuất!");
    return;
  }

  const headers = Object.keys(data[0]);

  const csvContent = [
    headers.join(","), // Header row
    ...data.map((row) =>
      headers
        .map((fieldName) => {
          let value = row[fieldName];

          if (value === null || value === undefined) {
            return "";
          }

          if (typeof value === "string") {
            value = `"${value.replace(/"/g, '""')}"`;
          }

          if (typeof value === "object") {
            value = `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }

          return value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToJSON = (data, filename) => {
  if (!data || !data.length) {
    alert("Không có dữ liệu để xuất!");
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
