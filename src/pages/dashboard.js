import { useState, useEffect, useRef } from "react";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Button } from "primereact/button";
import { Paginator } from "primereact/paginator";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";

export const Dashboard = () => {
  const [productNameFilter, setProductNameFilter] = useState("");
  const [productDetailsFilter, setProductDetailsFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [quantityFilter, setQuantityFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [postImg, setPostImg] = useState(null);

  const [rowId, setRowId] = useState("");


  const columns = [
    { field: "productName", header: "productName" },
    { field: "productDetails", header: "productDetails" },
    { field: "price", header: "price" },
    { field: "quantity", header: "quantity" },
    { field: "createdAt", header: "createdAt" },
  ];
  const [productList, setProductList] = useState();
  const [totalRecords, setTotalRecords] = useState();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(12); // Rows per page

  const [showAddRow, setShowAddRow] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(null);
  const [newRow, setNewRow] = useState({
    productName: "",
    productDetails: "",
    price: "",
    quantity: "",
    createdAt: "",
  });
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    "country.name": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    representative: { value: null, matchMode: FilterMatchMode.IN },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
    verified: { value: null, matchMode: FilterMatchMode.EQUALS },
  });
  const [loading, setLoading] = useState(true);

  const imageBodyTemplate = (product) => {
    return (
      <div className="w-10 h-10">
        <img
          src={`http://localhost:5000/${product.productImage}`}
          alt={product.image}
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
    );
  };

  const BindList = async () => {

    const requestBody = {
      productName: productNameFilter,
      productDetails: productDetailsFilter,
      price: priceFilter,
      quantity: quantityFilter,
      createdAt: selectedDate,
      // Add other properties as needed
    };
    const resp = await axios.post(
      "http://localhost:5000/api/products/list",
      requestBody
    );
    console.log("selectedDate",selectedDate);

    if (resp.data.responseStatus === "success") {
      setProductList(resp.data.responseData.products);
      setTotalRecords(resp.data.responseData.totalCount);
      setLoading(false);
    }
  };

  const actionTemplate = (product) => {
    return (
      <div className="flex items-center gap-4 ">
        <i
          onClick={() => {
            setVisible(true);
            setRowId(product?._id);
          }}
          className="pi pi-trash text-[18px] xl:text-[1vw] cursor-pointer"
        ></i>
      </div>
    );
  };

 

  const onRowEditComplete = async (e) => {
    setLoading(true);
    const respData = {
      price: e.newData.price,
      productDetails: e.newData.productDetails,
      productName: e.newData.productName,
      quantity: e.newData.quantity,
      createdAt: e.newData.createdAt,
    };

    const resp = await axios.put(
      `http://localhost:5000/api/products/${e.newData._id}`,
      respData
    );
    if (resp.data.responseData.status === "success") {
      setLoading(false);
    }
  };

  const textEditor = (options) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  const handleDateChange = (e) => {
    const selectedDateValue = e;

    if (selectedDateValue) {
      // Subtract 1 day from the selected date
      const modifiedDate = new Date(selectedDateValue);
      modifiedDate.setDate(modifiedDate.getDate() + 1);
    console.log('modifiedDate',modifiedDate);
      // Now `modifiedDate` is 1 day before the selected date
      const utcDateString = modifiedDate.toISOString();
      // Continue with your logic (e.g., sending the modified date to the API)
      setSelectedDate(utcDateString);
    }
  };
  const onFilterInputChange = (value, field) => {
    // Update the corresponding filter state based on the column field
    switch (field) {
      case "productName":
        setProductNameFilter(value);
        break;
      case "productDetails":
        setProductDetailsFilter(value);
        break;
      case "price":
        setPriceFilter(value);
        break;
      case "quantity":
        setQuantityFilter(value);
        break;
      case "createdAt":
        handleDateChange(value)
        break;
      default:
        break;
    }
  };

  const dynamicColumns = columns.map((col, index) => {
    console.log("col.field:", col.field);

    return (
      <Column
        key={index}
        editor={(options) => textEditor(options)}
        field={col.field}
        sortable
        filter
        filterElement={
          col.field === "createdAt" ? (
            <Calendar
              placeholder="createdAt"
              onChange={(e) => onFilterInputChange(e.target.value, col.field)}
            />
          ) : (
            <input
              type="text"
              className="p-inputtext"
              style={{ width: "100%" }}
              onChange={(e) => onFilterInputChange(e.target.value, col.field)}
            />
          )
        }
        header={col.header}
      />
    );
  });
  const handleImageChange = (event) => {
    const image = event.target.files[0];
    console.log("image", image);
    setSelectedImage(URL.createObjectURL(image));
    setPostImg(event.target.files[0]);
  };

  const renderAddRow = () => (
    <div className="flex justify-between ">
      <input
        type="file"
        id="image"
        name="postImg"
        accept="image/*"
        className="absolute opacity-0 pointer w-[95px]"
        onChange={handleImageChange}
      />
      <p className="border  px-3 py-2 cursor-pointer">upload</p>
      <InputText
        type="text"
        placeholder="productName"
        value={newRow.productName || ""}
        onChange={(e) => setNewRow({ ...newRow, productName: e.target.value })}
      />
      <InputText
        type="text"
        placeholder="productDetails"
        value={newRow.productDetails || ""}
        onChange={(e) =>
          setNewRow({ ...newRow, productDetails: e.target.value })
        }
      />
      <InputText
        type="text"
        placeholder="price"
        value={newRow.price || ""}
        onChange={(e) => setNewRow({ ...newRow, price: e.target.value })}
      />
      <InputText
        type="text"
        placeholder="quantity"
        value={newRow.quantity || ""}
        onChange={(e) => setNewRow({ ...newRow, quantity: e.target.value })}
      />
      <Calendar
        placeholder="createdAt"
        value={newRow.createdAt}
        onChange={(e) => setNewRow({ ...newRow, createdAt: e.value })}
      />
      <Button
        label="Add"
        className="bg-[green] text-[#fff] px-3 py-2"
        onClick={addNewRow}
      />

<Button
        label="Remove"
        className="bg-[green] text-[#fff] px-3 py-2"
        onClick={()=>{setLoading(true);setShowAddRow(false)}}
      />
    </div>
  );

  const addNewRow = async () => {
  
    const formData = new FormData();
    setLoading(true);
    formData.append("price", newRow.price);
    formData.append("productDetails", newRow.productDetails);
    formData.append("productName", newRow.productName);
    formData.append("quantity", newRow.quantity);
    formData.append("createdAt", newRow.createdAt);
    formData.append("productImage", postImg);
    const resp = await axios.post(
      "http://localhost:5000/api/products",
      formData
    );
    if (resp.data.responseData.status === "success") {
      setLoading(false);
    }
  };

  

 

  const allowEdit = (rowData) => {
    return rowData.name !== "Blue Band";
  };

  const [visible, setVisible] = useState(false);
  const toast = useRef(null);

  const accept = async () => {
    setLoading(true);

    const resp = await axios.delete(
      `http://localhost:5000/api/products/${rowId}`
    );
    console.log("resp", resp);
    if (resp.data.responseData.status === "success") {
      setLoading(false);
    }
  };

  const reject = () => {
    toast.current.show({
      severity: "warn",
      summary: "Rejected",
      detail: "You have rejected",
      life: 3000,
    });
  };

   useEffect(() => {
    BindList();
  }, [
    productNameFilter,
    productDetailsFilter.priceFilter,
    quantityFilter,
    priceFilter,
    loading,
    selectedDate
  ]);
  return (
    <div className="card">
      <DataTable
        value={productList}
        className="custTable tableCust custCheckBox"
        scrollable
        responsiveLayout="scroll"
        style={{ width: "100%" }}
        currentPageReportTemplate="Rows per page {first}-{last} of {totalRecords}"
        rows={12}
        rowsPerPageOptions={[12, 25, 50]}
        onSelectionChange={(e) => setSelectedProducts(e.value)}
        selection={selectedProducts}
        dataKey="id"
        showGridlines
        filters={filters}
        globalFilterFields={[
          "productName",
          "productDetails",
          "price",
          "quantity",
          "createdAt",
        ]}
        filterDisplay="row"
        loading={loading}
        editMode="row"
        onRowEditComplete={onRowEditComplete}
      >
        <Column header="productImage" body={imageBodyTemplate} />
        {dynamicColumns}
        <Column
          field="action"
          header="Action"
          className="action-shadow-table"
          frozen
          alignFrozen="right"
          align="center"
          style={{ minWidth: "7rem" }}
          rowEditor={allowEdit}
        ></Column>
        <Column
          field="action"
          header=""
          className="action-shadow-table"
          frozen
          alignFrozen="right"
          align="center"
          body={actionTemplate}
          style={{ minWidth: "1rem" }}
        ></Column>
      </DataTable>

      {showAddRow && renderAddRow()}
      <div className="flex justify-end mt-[2%]">
        <Button
          label="Add Row"
          className="bg-[green] text-[#fff]"
          onClick={() => setShowAddRow(!showAddRow)}
          icon="pi pi-plus"
        />
      </div>

      <div className="card">
        <Paginator
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPageChange={(e) => {
            setFirst(e.first);
            setRows(e.rows);
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </div>
      <>
        <Toast ref={toast} />
        <ConfirmDialog
          group="declarative"
          visible={visible}
          onHide={() => setVisible(false)}
          message="Are you sure you want to proceed?"
          header="Confirmation"
          icon="pi pi-exclamation-triangle"
          accept={accept}
          reject={reject}
        />
      </>
    </div>
  );
};
