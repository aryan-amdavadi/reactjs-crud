import React, { useState, useEffect } from "react";
import "./AddDiscount.css";
import axios from "axios";
import AppNavbar from "../Content/Navbar";
import { useLocation, useNavigate } from "react-router-dom";

export default function AddDiscount() {
  const navigate = useNavigate();
  const location = useLocation();

  const [discountId, setDiscountId] = useState();
  const [discountCode, setDiscountCode] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [requirementType, setRequirementType] = useState("none");
  const [requirementValue, setRequirementValue] = useState("");
  const [enabled, setEnabled] = useState(true);

  const [endDateEnabled, setEndDateEnabled] = useState(false);
  const [specificProductEnabled, setSpecificProductEnabled] = useState(false);
  const [eligibility, setEligibility] = useState("everyone");

  const [query, setQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [searchProductData, setSearchProductData] = useState([]);
  const [searchUserData, setSearchUserData] = useState([]);

  const [usageLimitChecked, setUsageLimitChecked] = useState(true);
  const [onePerCustomerChecked, setOnePerCustomerChecked] = useState(false);
  const [newCustomersOnlyChecked, setNewCustomersOnlyChecked] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [errors, setErrors] = useState({});

  const loadProductsByIds = async (productIds) => {
    try {
      const res = await axios.post(
        "http://localhost:8081/api/getproductsbyids",
        {
          ids: productIds,
        }
      );
      setSelectedProducts(res.data); // Assumes each item has { id, title }
    } catch (error) {
      console.error("Failed to load products by IDs:", error);
    }
  };

  const loadUsersByIds = async (userIds) => {
    try {
      const res = await axios.post("http://localhost:8081/api/getusersbyids", {
        ids: userIds,
      });
      setSelectedUsers(res.data);
    } catch (error) {
      console.error("Failed to load users by IDs:", error);
    }
  };

  useEffect(() => {
    if (location.state?.handle === "edit" && location.state.discount_data) {
      const discountData = location.state.discount_data;
      setDiscountCode(discountData.code || "");
      setDiscountValue(discountData.value || "");
      setStartDate(discountData.start_date?.split("T")[0] || "");
      setEndDateEnabled(!!discountData.end_date);
      setEndDate(discountData.end_date?.split("T")[0] || "");
      setDiscountId(discountData.id || "");
      setUsageLimitChecked(discountData.usage_limit !== null);
      setUsageLimit(discountData.usage_limit || "");
      setOnePerCustomerChecked(!!discountData.one_per_customer);
      setNewCustomersOnlyChecked(!!discountData.new_customers_only);

      setRequirementType(discountData.requirement_type || "none");
      setRequirementValue(discountData.requirement_value || "");

      setEnabled(Boolean(discountData.enabled));

      // Set discount type radio (percent or fixed)
      const typeRadio = document.getElementById(discountData.type);
      if (typeRadio) typeRadio.checked = true;

      // Handle specific products
      if (discountData.product_scope === "specific") {
        setSpecificProductEnabled(true);
        try {
          const productIds = JSON.parse(discountData.product_ids);
          loadProductsByIds(productIds);
        } catch {
          setSelectedProducts([]);
        }
      } else {
        setSpecificProductEnabled(false);
      }

      // Handle specific users
      if (discountData.user_scope === "specific") {
        setEligibility("specificUsers");
        try {
          const userIds = JSON.parse(discountData.user_ids);
          loadUsersByIds(userIds);
        } catch {
          setSelectedUsers([]);
        }
      } else {
        setEligibility(discountData.user_scope || "everyone");
      }
    }
  }, [location.state]);

  const generateDiscountCode = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (!value) return setSearchProductData([]);

    axios
      .post("http://localhost:8081/api/searchproduct", { keyword: value })
      .then((res) => setSearchProductData(res.data))
      .catch((err) => console.error("Product Search Error:", err));
  };

  const handleSelect = (product) => {
    const exists = selectedProducts.find((p) => p.id === product.id);
    if (!exists) {
      setSelectedProducts((prev) => [...prev, product]);
    }
    setQuery("");
    setSearchProductData([]);
  };

  const handleUserChange = (e) => {
    const value = e.target.value;
    setUserQuery(value);
    if (!value) return setSearchUserData([]);

    axios
      .post("http://localhost:8081/api/searchuser", { keyword: value })
      .then((res) => {
        setSearchUserData(res.data);
      })
      .catch((err) => console.error("User Search Error:", err));
  };
  const handleUserSelect = (user) => {
    const exists = selectedUsers.find((u) => u.Emp_Id === user.Emp_Id);
    if (!exists) {
      setSelectedUsers((prev) => [...prev, user]);
    }

    setUserQuery("");
    setSearchUserData([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    let valid = true;

    if (!discountCode.trim()) {
      newErrors.discountCode = "Discount code is required";
      valid = false;
    }

    if (!discountValue || Number(discountValue) <= 0) {
      newErrors.discountValue = "Enter a valid discount value";
      valid = false;
    }

    if (!startDate) {
      newErrors.startDate = "Start date is required";
      valid = false;
    }

    if (endDateEnabled) {
      if (!endDate) {
        newErrors.endDate = "End date is required";
        valid = false;
      } else if (new Date(endDate) <= new Date(startDate)) {
        newErrors.endDate = "End date must be after start date";
        valid = false;
      }
    }

    setErrors(newErrors);

    if (valid) {
      const discountData = {
        discountCode,
        discountValue,
        discountType: document.querySelector('input[name="type"]:checked')?.id,
        applicableProducts: specificProductEnabled
          ? selectedProducts.map((p) => p.id)
          : "All Products",

        eligibleUsers:
          eligibility === "specificUsers"
            ? selectedUsers.map((u) => u.Emp_Id)
            : eligibility,

        requirementType: requirementType !== "none" ? requirementType : "None",
        requirementValue: requirementType !== "none" ? requirementValue : null,
        startDate,
        endDate: endDateEnabled ? endDate : null,
        usageLimit: usageLimitChecked ? usageLimit : null,
        onePerCustomer: onePerCustomerChecked,
        newCustomersOnly: newCustomersOnlyChecked,
        enabled,
      };
      if (location.state?.handle === "edit") {
        //Axios Call For Edit
        discountData.discount_id = discountId;
        axios
          .post("http://localhost:8081/api/editdiscount", discountData)
          .then((responce) => {
            console.log("Responce :", responce.data);
            navigate("/discount");
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        axios
          .post("http://localhost:8081/api/adddiscount", discountData)
          .then((responce) => {
            console.log("Responce :", responce.data);
            navigate("/discount");
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  };

  return (
    <>
      <AppNavbar />
      <div className="tabster-discount-page">
        <div className="discount-header">
          <h2>
            {location.state?.handle === "edit" ? "Edit" : "Create"} Discount
          </h2>
        </div>

        <div
          className="discount-form"
          style={{ backgroundColor: "rgb(0 255 185 / 4%)" }}
        >
          <div className="input-group">
            <label>Discount Code</label>
            <div className="input-with-btn">
              <input
                type="text"
                placeholder="e.g. TABSTER10"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <button onClick={() => setDiscountCode(generateDiscountCode())}>
                Generate
              </button>
            </div>
            {errors.discountCode && (
              <div className="error">{errors.discountCode}</div>
            )}
          </div>

          <div className="d-flex type my-3">
            <div className="radio-group col-6 checkbox-group">
              <div className="d-flex">
                <input type="radio" id="percent" name="type" defaultChecked />
                <label htmlFor="percent">Percentage</label>
              </div>
              <div className="d-flex">
                <input type="radio" id="fixed" name="type" />
                <label htmlFor="fixed">Fixed Amount</label>
              </div>
              <input
                type="number"
                placeholder="Value"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
              {errors.discountValue && (
                <div className="error">{errors.discountValue}</div>
              )}
            </div>
            <div className="radio-group col-6 checkbox-group">
              <div className="d-flex">
                <input
                  type="radio"
                  id="allProducts"
                  name="products"
                  checked={!specificProductEnabled}
                  onChange={() => setSpecificProductEnabled(false)}
                />
                <label htmlFor="allProducts">All Products</label>
              </div>
              <div className="d-flex">
                <input
                  type="radio"
                  id="specificProducts"
                  name="products"
                  checked={specificProductEnabled}
                  onChange={() => setSpecificProductEnabled(true)}
                />
                <label htmlFor="specificProducts">Specific Products</label>
              </div>

              {specificProductEnabled && (
                <div className="tabster-autocomplete">
                  <div className="search-wrapper">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={query}
                      onChange={handleChange}
                    />
                    <span className="search-icon">
                      <i className="fas fa-search" />
                    </span>
                  </div>

                  {searchProductData.length > 0 && (
                    <ul className="suggestion-box">
                      {searchProductData.map((item) => (
                        <li
                          key={item.id}
                          className="suggestion-item"
                          onClick={() => handleSelect(item)}
                        >
                          {item.title}
                        </li>
                      ))}
                    </ul>
                  )}

                  {selectedProducts.length > 0 && (
                    <div className="selected-product-list">
                      {selectedProducts.map((product) => (
                        <div key={product.id} className="selected-product">
                          {product.title}
                          <button
                            className="remove-btn"
                            onClick={() =>
                              setSelectedProducts((prev) =>
                                prev.filter((p) => p.id !== product.id)
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="d-flex type my-3">
            <div className="radio-group col-6">
              <div className="d-flex">
                <input
                  type="radio"
                  id="everyone"
                  name="eligibility"
                  value="everyone"
                  checked={eligibility === "everyone"}
                  onChange={(e) => setEligibility(e.target.value)}
                />
                <label htmlFor="everyone">Everyone</label>
              </div>

              <div className="d-flex">
                <input
                  type="radio"
                  id="specificUsers"
                  name="eligibility"
                  value="specificUsers"
                  checked={eligibility === "specificUsers"}
                  onChange={(e) => setEligibility(e.target.value)}
                />
                <label htmlFor="specificUsers">Specific Users</label>
              </div>
              {eligibility === "specificUsers" && (
                <div
                  className="tabster-autocomplete"
                  style={{ marginTop: "14px" }}
                >
                  <div className="search-wrapper">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userQuery}
                      onChange={handleUserChange}
                    />
                    <span className="search-icon">
                      <i className="fas fa-search" />
                    </span>
                  </div>
                  <ul className="suggestion-box">
                    {searchUserData.map((user, index) => (
                      <li
                        key={
                          user.id ||
                          `${user.First_Name}-${user.Last_Name}-${index}`
                        }
                        className="suggestion-item"
                        onClick={() => handleUserSelect(user)}
                      >
                        {user.First_Name} {user.Last_Name}
                      </li>
                    ))}
                  </ul>

                  {selectedUsers.length > 0 && (
                    <div className="selected-user-list">
                      {selectedUsers.map((user, index) => (
                        <div
                          key={
                            user.Emp_Id ||
                            `${user.First_Name}-${user.Last_Name}-${index}`
                          }
                          className="selected-user"
                        >
                          <span>
                            {user.First_Name} {user.Last_Name}
                          </span>
                          <button
                            className="remove-btn"
                            onClick={() =>
                              setSelectedUsers((prev) =>
                                prev.filter((u) => u.Emp_Id !== user.Emp_Id)
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="radio-group col-6">
              <div className="d-flex">
                <input
                  type="radio"
                  id="minPurchase"
                  name="requirements"
                  value="minPurchase"
                  checked={requirementType === "minPurchase"}
                  onChange={(e) => setRequirementType(e.target.value)}
                />
                <label htmlFor="minPurchase">Minimum Purchase Amount</label>
              </div>
              <div className="d-flex">
                <input
                  type="radio"
                  id="minQty"
                  name="requirements"
                  value="minQty"
                  checked={requirementType === "minQty"}
                  onChange={(e) => setRequirementType(e.target.value)}
                />
                <label htmlFor="minQty">Minimum Quantity</label>
              </div>
              <div className="d-flex">
                <input
                  type="radio"
                  id="none"
                  name="requirements"
                  value="none"
                  checked={requirementType === "none"}
                  onChange={(e) => setRequirementType(e.target.value)}
                />
                <label htmlFor="none">None</label>
              </div>

              {requirementType !== "none" && (
                <input
                  type="number"
                  placeholder={
                    requirementType === "minPurchase"
                      ? "Enter minimum purchase amount"
                      : "Enter minimum quantity"
                  }
                  value={requirementValue}
                  onChange={(e) => setRequirementValue(e.target.value)}
                  style={{ marginTop: "12px", height: "50px" }}
                />
              )}
            </div>
          </div>
          <div className="radio-group checkbox-group">
            <div className="d-flex">
              <input
                type="checkbox"
                id="limitTotal"
                checked={usageLimitChecked}
                onChange={() => setUsageLimitChecked(!usageLimitChecked)}
              />
              <label htmlFor="limitTotal" style={{ marginLeft: "8px" }}>
                Limit number of times this discount can be used in total.
              </label>
            </div>

            {usageLimitChecked && (
              <>
                <input
                  type="number"
                  placeholder="e.g. 100 uses"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                />
                {errors.usageLimit && (
                  <div className="error">{errors.usageLimit}</div>
                )}
              </>
            )}

            <div className="d-flex">
              <input
                type="checkbox"
                id="onePerCustomer"
                checked={onePerCustomerChecked}
                onChange={() =>
                  setOnePerCustomerChecked(!onePerCustomerChecked)
                }
              />
              <label htmlFor="onePerCustomer" style={{ marginLeft: "8px" }}>
                Limit to one use per customer
              </label>
            </div>

            <div className="d-flex">
              <input
                type="checkbox"
                id="newCustomersOnly"
                checked={newCustomersOnlyChecked}
                onChange={() =>
                  setNewCustomersOnlyChecked(!newCustomersOnlyChecked)
                }
              />
              <label htmlFor="newCustomersOnly" style={{ marginLeft: "8px" }}>
                New Customers Only
              </label>
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              {errors.startDate && (
                <div className="error">{errors.startDate}</div>
              )}
            </div>
            <div className="input-group">
              {endDateEnabled && (
                <>
                  <label>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  {errors.endDate && (
                    <div className="error">{errors.endDate}</div>
                  )}
                </>
              )}
            </div>
          </div>
          <label>
            <input
              type="checkbox"
              checked={endDateEnabled}
              onChange={() => setEndDateEnabled(!endDateEnabled)}
            />
            <span style={{ marginLeft: "4px" }}>Set End Date</span>
          </label>
          <div className="tabster-toggle">
            <label className="switch">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => setEnabled(!enabled)}
              />

              <span className="slider round" />
            </label>
            <span className="toggle-label">Enable Discount</span>
          </div>

          <div className="form-actions">
            <button className="btn-create" onClick={handleSubmit}>
              {location.state?.handle === "edit" ? "Edit" : "Create"}
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                navigate("/discount");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
