import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getProvinces,
  getDistricts,
  getWards,
  searchAddressOSM,
} from "../api/DeliveryApi";
import { registerUser, updateStoreId, updateUser } from "../api/UserAPI";
import { addStore } from "../api/StoreApi";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import firebase from "firebase/compat/app";
import { auth } from "../firebase/firebase";

import ImageLight from "../assets/img/create-account-office.jpeg";
import ImageDark from "../assets/img/create-account-office-dark.jpeg";
import { NavLink } from "react-router-dom/cjs/react-router-dom.min";
import { useHistory } from "react-router-dom/cjs/react-router-dom";

const Input = ({ className, ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className}`}
    {...props}
  />
);

const Label = ({ children, check, className, ...props }) => (
  <label
    className={`block text-sm font-medium text-gray-700 dark:text-gray-200 ${
      check ? "flex items-center" : ""
    } ${className}`}
    {...props}
  >
    {children}
  </label>
);

const Button = ({ children, className, disabled, ...props }) => (
  <button
    className={`w-full px-4 py-2 font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

const Select = ({ children, className, ...props }) => (
  <select
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className}`}
    {...props}
  >
    {children}
  </select>
);

function EnhancedRegistration() {
  const isMountedRef = useRef(true);
  const history = useHistory();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    avatar: "default_avatar_url",
    userType: "",
    isActive: true,
  });

  const [storeData, setStoreData] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    description: "",
    image: "default_image_url",
    status: "pending",
    latitude: "",
    longitude: "",
    provinceId: "",
    districtId: "",
    wardCode: "",
    provinceName: "",
    districtName: "",
    wardName: "",
    rating: 0,
    reviewCount: 0,
  });

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await getProvinces();
        if (isMountedRef.current) {
          setProvinces(response.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải tỉnh/thành phố:", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (storeData.provinceId) {
      fetchDistricts();
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [storeData.provinceId]);

  useEffect(() => {
    if (storeData.districtId) {
      fetchWards();
    } else {
      setWards([]);
    }
  }, [storeData.districtId]);

  const fetchDistricts = async () => {
    try {
      const response = await getDistricts(storeData.provinceId);
      if (isMountedRef.current) {
        setDistricts(response.data || []);
        setWards([]);
        safeSetState(setStoreData, (prev) => ({
          ...prev,
          districtId: "",
          wardCode: "",
          districtName: "",
          wardName: "",
        }));
      }
    } catch (error) {
      console.error("Lỗi khi tải quận/huyện:", error);
    }
  };

  const fetchWards = async () => {
    try {
      const response = await getWards(storeData.districtId);
      if (isMountedRef.current) {
        setWards(response.data || []);
        safeSetState(setStoreData, (prev) => ({
          ...prev,
          wardCode: "",
          wardName: "",
        }));
      }
    } catch (error) {
      console.error("Lỗi khi tải phường/xã:", error);
    }
  };

  useEffect(() => {
    const fetchCoordinates = async () => {
      const {address, provinceName, districtName, wardName } = storeData;

      if (address && provinceName && districtName && wardName) {
        const fullAddress = `${address}, ${wardName}, ${districtName}, ${provinceName}, Vietnam`;

        try {
          const coordinates = await searchAddressOSM(fullAddress);
          if (coordinates && isMountedRef.current) {
            safeSetState(setStoreData, (prev) => ({
              ...prev,
              latitude: coordinates.lat.toString(),
              longitude: coordinates.lon.toString(),
            }));

            safeSetState(setErrors, (prev) => ({
              ...prev,
              latitude: "",
              longitude: "",
            }));

            console.log(
              `Đã tự động lấy tọa độ cho địa chỉ: ${fullAddress}`,
              coordinates
            );
          }
        } catch (error) {
          console.error("Failed to fetch coordinates:", error);
        }
      }
    };

    const timeoutId = setTimeout(fetchCoordinates, 500);
    return () => clearTimeout(timeoutId);
  }, [
    storeData.provinceName,
    storeData.districtName,
    storeData.wardName,
    storeData.address,
  ]);

  const safeSetState = (stateSetter, value) => {
    if (isMountedRef.current) {
      stateSetter(value);
    }
  };

  const handleUserInputChange = (field, value) => {
    safeSetState(setUserData, (prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      safeSetState(setErrors, (prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleStoreInputChange = (field, value) => {
    safeSetState(setStoreData, (prev) => {
      const updatedData = { ...prev, [field]: value };

      if (field === "provinceId") {
        const province = provinces.find((p) => p.ProvinceID == value);
        updatedData.provinceName = province ? province.ProvinceName : "";
      } else if (field === "districtId") {
        const district = districts.find((d) => d.DistrictID == value);
        updatedData.districtName = district ? district.DistrictName : "";
      } else if (field === "wardCode") {
        const ward = wards.find((w) => w.WardCode == value);
        updatedData.wardName = ward ? ward.WardName : "";
      }

      return updatedData;
    });

    if (errors[field]) {
      safeSetState(setErrors, (prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateField = (field, value, isStore = false) => {
    let error = "";

    if (!isStore) {
      switch (field) {
        case "fullName":
          if (!value.trim()) error = "Họ và tên là bắt buộc";
          else if (value.trim().length < 2)
            error = "Họ và tên phải có ít nhất 2 ký tự";
          break;
        case "email":
          if (!value.trim()) error = "Email là bắt buộc";
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
            error = "Email không hợp lệ";
          break;
        case "phone":
          if (value && !/^[0-9]{10,15}$/.test(value))
            error = "Số điện thoại phải có 10-15 chữ số";
          break;
        case "password":
          if (!value) error = "Mật khẩu là bắt buộc";
          else if (value.length < 6) error = "Mật khẩu phải có ít nhất 6 ký tự";
          break;
        case "confirmPassword":
          if (!value) error = "Xác nhận mật khẩu là bắt buộc";
          else if (value !== userData.password)
            error = "Mật khẩu xác nhận không khớp";
          break;
        default:
          break;
      }
    } else {
      switch (field) {
        case "name":
          if (!value.trim()) error = "Tên cửa hàng là bắt buộc";
          break;
        case "address":
          if (!value.trim()) error = "Địa chỉ cửa hàng là bắt buộc";
          break;
        case "phoneNumber":
          if (!value.trim()) error = "Số điện thoại cửa hàng là bắt buộc";
          else if (!/^[0-9]{10,15}$/.test(value))
            error = "Số điện thoại phải có 10-15 chữ số";
          break;
        case "email":
          if (!value.trim()) error = "Email cửa hàng là bắt buộc";
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
            error = "Email cửa hàng không hợp lệ";
          break;
        case "description":
          if (value && value.length > 500)
            error = "Mô tả không được vượt quá 500 ký tự";
          break;
        case "latitude":
          if (!value) error = "Vĩ độ là bắt buộc";
          else if (isNaN(value) || value < -90 || value > 90)
            error = "Vĩ độ phải từ -90 đến 90";
          break;
        case "longitude":
          if (!value) error = "Kinh độ là bắt buộc";
          else if (isNaN(value) || value < -180 || value > 180)
            error = "Kinh độ phải từ -180 đến 180";
          break;
        case "provinceId":
          if (!value) error = "Tỉnh/Thành phố là bắt buộc";
          break;
        case "districtId":
          if (!value) error = "Quận/Huyện là bắt buộc";
          break;
        case "wardCode":
          if (!value) error = "Phường/Xã là bắt buộc";
          break;
        default:
          break;
      }
    }

    return error;
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      const fields = [
        "fullName",
        "email",
        "password",
        "confirmPassword",
        "phone",
      ];
      fields.forEach((field) => {
        const error = validateField(field, userData[field], false);
        if (error) newErrors[field] = error;
      });
    } else if (step === 2) {
      const fields = [
        "name",
        "address",
        "phoneNumber",
        "email",
        "description",
        "latitude",
        "longitude",
        "provinceId",
        "districtId",
        "wardCode",
      ];
      fields.forEach((field) => {
        const error = validateField(field, storeData[field], true);
        if (error) newErrors[field] = error;
      });
    }

    safeSetState(setErrors, newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep1 = () => {
    const { fullName, email, password, confirmPassword } = userData;
    return (
      fullName &&
      email &&
      password &&
      confirmPassword &&
      password === confirmPassword &&
      email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) &&
      (userData.phone === "" || userData.phone.match(/^[0-9]{10,15}$/))
    );
  };

  const validateStep2 = () => {
    const {
      name,
      address,
      phoneNumber,
      email,
      latitude,
      longitude,
      provinceId,
      districtId,
      wardCode,
    } = storeData;
    return (
      name &&
      address &&
      phoneNumber &&
      email &&
      phoneNumber.match(/^[0-9]{10,15}$/) &&
      email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) &&
      latitude &&
      longitude &&
      provinceId &&
      districtId &&
      wardCode &&
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  };

  const handleNext = () => {
    if (validateStep(1) && currentStep === 1) {
      safeSetState(setCurrentStep, 2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      safeSetState(setCurrentStep, 1);
    }
  };

  const handleSubmit = async () => {
  if (!validateStep(2) || isLoading) return;

  console.log("Starting registration process...");
  safeSetState(setIsLoading, true);
  
  try {
    console.log("Creating Firebase user...");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    
    console.log("Firebase user created:", userCredential.user.uid);
    
    const user = userCredential.user;
    const userDataForDB = {
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone || null,
      dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : null,
      userId: user.uid,
      userType: "682cf25e7d2a6f720e274fa6",
      avatar: userData.avatar,
      address: userData.address,
      gender: userData.gender,
      storeId: null,
      isActive: userData.isActive,
    };

    const storeDataForDB = {
      ghnShopId: null,
      name: storeData.name,
      address: storeData.address,
      phoneNumber: storeData.phoneNumber,
      email: storeData.email,
      description: storeData.description,
      image: storeData.image,
      status: storeData.status,
      ownerId: null,
      latitude: parseFloat(storeData.latitude),
      longitude: parseFloat(storeData.longitude),
      provinceId: parseInt(storeData.provinceId),
      districtId: parseInt(storeData.districtId),
      wardCode: storeData.wardCode,
      provinceName: storeData.provinceName,
      districtName: storeData.districtName,
      wardName: storeData.wardName,
      rating: storeData.rating,
      reviewCount: storeData.reviewCount,
    };

    if (isMountedRef.current) {
      try {
        const savedUser = await registerUser({ data: userDataForDB });
        storeDataForDB.ownerId = savedUser.data.user._id;
        const savedStore = await addStore(storeDataForDB);
        const newStoreId = savedStore.data.store._id;
        await updateStoreId({
          userId: savedUser.data.user._id,
          storeId: newStoreId,
        });
        await auth.signOut();
        history.push("/");
        safeSetState(setIsLoading, false);
        
      } catch (dbError) {
        console.error("Database operation failed:", dbError);
        throw dbError;
      }
    }
  } catch (error) {
    console.error("Registration failed:", error);
    
    if (isMountedRef.current) {
      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại!";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email này đã được sử dụng. Vui lòng chọn email khác.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email không hợp lệ.";
      }

      alert(errorMessage);
      safeSetState(setIsLoading, false);
    }
  }
};

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleStoreInputChange(
            "latitude",
            position.coords.latitude.toString()
          );
          handleStoreInputChange(
            "longitude",
            position.coords.longitude.toString()
          );
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Không thể lấy vị trí hiện tại. Vui lòng nhập thủ công.");
        }
      );
    } else {
      alert("Trình duyệt không hỗ trợ định vị.");
    }
  };

  const getCordinate = async () => {
    const { address, provinceName, districtName, wardName } = storeData;
    console.log(
      "Searching coordinates for:",
      address,
      provinceName,
      districtName,
      wardName,
    );

    if (provinceName && districtName && wardName) {
      const fullAddress = `${address}, ${wardName}, ${districtName}, ${provinceName}, Vietnam`;
      const coordinates = await searchAddressOSM(fullAddress);
      if (coordinates) {
        handleStoreInputChange("latitude", coordinates.lat.toString());
        handleStoreInputChange("longitude", coordinates.lon.toString());
      } else {
        alert("Không thể tìm thấy tọa độ cho địa chỉ này");
      }
    } else {
      alert("Vui lòng nhập đầy đủ thông tin địa chỉ trước");
    }
  };

  const renderStep1 = () => (
    <div className="w-full">
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1
                  ? "bg-purple-600 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              1
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Thông tin cá nhân
            </span>
          </div>
          <div
            className={`w-12 h-1 mt-4 ${
              currentStep >= 2 ? "bg-purple-600" : "bg-gray-300"
            }`}
          ></div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2
                  ? "bg-purple-600 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              2
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Thông tin cửa hàng
            </span>
          </div>
        </div>
      </div>

      <h1 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
        Tạo tài khoản - Thông tin cá nhân
      </h1>

      <div className="space-y-4">
        <Label>
          <span>Họ và tên *</span>
          <Input
            className="mt-1"
            type="text"
            placeholder="Nguyễn Văn A"
            value={userData.fullName}
            onChange={(e) => handleUserInputChange("fullName", e.target.value)}
            onBlur={(e) => validateField("fullName", e.target.value)}
          />
          {errors.fullName && (
            <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
          )}
        </Label>

        <Label>
          <span>Email *</span>
          <Input
            className="mt-1"
            type="email"
            placeholder="john@doe.com"
            value={userData.email}
            onChange={(e) => handleUserInputChange("email", e.target.value)}
            onBlur={(e) => validateField("email", e.target.value)}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </Label>

        <Label>
          <span>Số điện thoại</span>
          <Input
            className="mt-1"
            type="tel"
            placeholder="0123456789"
            value={userData.phone}
            onChange={(e) => handleUserInputChange("phone", e.target.value)}
            onBlur={(e) => validateField("phone", e.target.value)}
          />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
          )}
        </Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Label>
            <span>Ngày sinh</span>
            <Input
              className="mt-1"
              type="date"
              value={userData.dateOfBirth}
              onChange={(e) =>
                handleUserInputChange("dateOfBirth", e.target.value)
              }
            />
          </Label>

          <Label>
            <span>Giới tính</span>
            <Select
              className="mt-1"
              value={userData.gender}
              onChange={(e) => handleUserInputChange("gender", e.target.value)}
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </Select>
          </Label>
        </div>

        <Label>
          <span>Địa chỉ</span>
          <Input
            className="mt-1"
            type="text"
            placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
            value={userData.address}
            onChange={(e) => handleUserInputChange("address", e.target.value)}
          />
        </Label>

        <Label>
          <span>Mật khẩu *</span>
          <Input
            className="mt-1"
            placeholder="***************"
            type="password"
            value={userData.password}
            onChange={(e) => handleUserInputChange("password", e.target.value)}
            onBlur={(e) => validateField("password", e.target.value)}
          />
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password}</p>
          )}
        </Label>

        <Label>
          <span>Xác nhận mật khẩu *</span>
          <Input
            className="mt-1"
            placeholder="***************"
            type="password"
            value={userData.confirmPassword}
            onChange={(e) =>
              handleUserInputChange("confirmPassword", e.target.value)
            }
            onBlur={(e) => validateField("confirmPassword", e.target.value)}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </Label>
      </div>

      <Button className="mt-6" onClick={handleNext} disabled={!validateStep1()}>
        <div className="flex items-center justify-center">
          Tiếp theo
          <ChevronRight className="w-4 h-4 ml-2" />
        </div>
      </Button>

      <hr className="my-8" />

      <div className="mt-4 text-center">
        <NavLink to="/login">
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
            Đã có tài khoản? Đăng nhập
          </p>
        </NavLink>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="w-full">
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1
                  ? "bg-purple-600 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              1
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Thông tin cá nhân
            </span>
          </div>
          <div
            className={`w-12 h-1 mt-4 ${
              currentStep >= 2 ? "bg-purple-600" : "bg-gray-300"
            }`}
          ></div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2
                  ? "bg-purple-600 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              2
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Thông tin cửa hàng
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <button
          onClick={handleBack}
          className="mr-3 p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          disabled={isLoading}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Thông tin cửa hàng
        </h1>
      </div>

      <div className="space-y-4">
        <Label>
          <span>Tên cửa hàng *</span>
          <Input
            className="mt-1"
            type="text"
            placeholder="Cửa hàng ABC"
            value={storeData.name}
            onChange={(e) => handleStoreInputChange("name", e.target.value)}
            onBlur={(e) => validateField("name", e.target.value, true)}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
          )}
        </Label>

        <Label>
          <span>Email cửa hàng *</span>
          <Input
            className="mt-1"
            type="email"
            placeholder="store@example.com"
            value={storeData.email}
            onChange={(e) => handleStoreInputChange("email", e.target.value)}
            onBlur={(e) => validateField("email", e.target.value, true)}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </Label>

        <Label>
          <span>Số điện thoại cửa hàng *</span>
          <Input
            className="mt-1"
            type="tel"
            placeholder="0123456789"
            value={storeData.phoneNumber}
            onChange={(e) =>
              handleStoreInputChange("phoneNumber", e.target.value)
            }
            onBlur={(e) => validateField("phoneNumber", e.target.value, true)}
            disabled={isLoading}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
          )}
        </Label>

        <Label>
          <span>Địa chỉ cửa hàng *</span>
          <Input
            className="mt-1"
            type="text"
            placeholder="456 Đường DEF, Quận GHI, TP.HCM"
            value={storeData.address}
            onChange={(e) => handleStoreInputChange("address", e.target.value)}
            onBlur={(e) => validateField("address", e.target.value, true)}
            disabled={isLoading}
          />
          {errors.address && (
            <p className="text-sm text-red-600 mt-1">{errors.address}</p>
          )}
        </Label>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
            Vị trí cửa hàng
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Label>
              <span>Tỉnh/Thành phố *</span>
              <Select
                className="mt-1"
                value={storeData.provinceId}
                onChange={(e) =>
                  handleStoreInputChange("provinceId", e.target.value)
                }
                disabled={isLoading}
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {provinces.map((province) => (
                  <option key={province.ProvinceID} value={province.ProvinceID}>
                    {province.ProvinceName}
                  </option>
                ))}
              </Select>
              {errors.provinceId && (
                <p className="text-sm text-red-600 mt-1">{errors.provinceId}</p>
              )}
            </Label>

            <Label>
              <span>Quận/Huyện *</span>
              <Select
                className="mt-1"
                value={storeData.districtId}
                onChange={(e) =>
                  handleStoreInputChange("districtId", e.target.value)
                }
                disabled={isLoading || !storeData.provinceId}
              >
                <option value="">Chọn quận/huyện</option>
                {districts.map((district) => (
                  <option key={district.DistrictID} value={district.DistrictID}>
                    {district.DistrictName}
                  </option>
                ))}
              </Select>
              {errors.districtId && (
                <p className="text-sm text-red-600 mt-1">{errors.districtId}</p>
              )}
            </Label>

            <Label>
              <span>Phường/Xã *</span>
              <Select
                className="mt-1"
                value={storeData.wardCode}
                onChange={(e) =>
                  handleStoreInputChange("wardCode", e.target.value)
                }
                disabled={isLoading || !storeData.districtId}
              >
                <option value="">Chọn phường/xã</option>
                {wards.map((ward) => (
                  <option key={ward.WardCode} value={ward.WardCode}>
                    {ward.WardName}
                  </option>
                ))}
              </Select>
              {errors.wardCode && (
                <p className="text-sm text-red-600 mt-1">{errors.wardCode}</p>
              )}
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Label>
              <span>Vĩ độ (Latitude) *</span>
              <Input
                className="mt-1"
                type="number"
                step="any"
                placeholder="21.0285"
                value={storeData.latitude}
                onChange={(e) =>
                  handleStoreInputChange("latitude", e.target.value)
                }
                onBlur={(e) => validateField("latitude", e.target.value, true)}
                disabled={isLoading}
              />
              {errors.latitude && (
                <p className="text-sm text-red-600 mt-1">{errors.latitude}</p>
              )}
              {storeData.latitude && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Tọa độ đã được tự động lấy từ địa chỉ
                </p>
              )}
            </Label>

            <Label>
              <span>Kinh độ (Longitude) *</span>
              <Input
                className="mt-1"
                type="number"
                step="any"
                placeholder="105.8542"
                value={storeData.longitude}
                onChange={(e) =>
                  handleStoreInputChange("longitude", e.target.value)
                }
                onBlur={(e) => validateField("longitude", e.target.value, true)}
                disabled={isLoading}
              />
              {errors.longitude && (
                <p className="text-sm text-red-600 mt-1">{errors.longitude}</p>
              )}
              {storeData.longitude && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Tọa độ đã được tự động lấy từ địa chỉ
                </p>
              )}
            </Label>
          </div>

          <div className="flex space-x-2 mb-4">
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700 flex-1"
              onClick={getCurrentLocation}
              disabled={isLoading}
            >
              📍 Lấy vị trí hiện tại
            </Button>

            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 flex-1"
              onClick={getCordinate}
              disabled={isLoading}
            >
              🗺️ Tìm tọa độ từ địa chỉ
            </Button>
          </div>
        </div>

        <Label>
          <span>Mô tả cửa hàng</span>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-1"
            rows="3"
            placeholder="Mô tả ngắn về cửa hàng của bạn... (tối đa 500 ký tự)"
            value={storeData.description}
            onChange={(e) =>
              handleStoreInputChange("description", e.target.value)
            }
            onBlur={(e) => validateField("description", e.target.value, true)}
            disabled={isLoading}
            maxLength="500"
          />
          <div className="text-sm text-gray-500 mt-1">
            {storeData.description.length}/500 ký tự
          </div>
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
          )}
        </Label>
      </div>

      <div className="flex space-x-4 mt-6">
        <Button
          className="bg-gray-500 hover:bg-gray-600"
          onClick={handleBack}
          disabled={isLoading}
        >
          <div className="flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay lại
          </div>
        </Button>

        <Button onClick={handleSubmit} disabled={!validateStep2() || isLoading}>
          {isLoading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 h-full max-w-6xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="flex flex-col overflow-y-auto md:flex-row">
          <div className="h-32 md:h-auto md:w-1/2">
            <img
              aria-hidden="true"
              className="object-cover w-full h-full dark:hidden"
              src={ImageLight}
              alt="Office"
            />
            <img
              aria-hidden="true"
              className="hidden object-cover w-full h-full dark:block"
              src={ImageDark}
              alt="Office"
            />
          </div>

          <main className="flex items-center justify-center p-6 sm:p-12 md:w-1/2">
            {currentStep === 1 ? renderStep1() : renderStep2()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default EnhancedRegistration;
