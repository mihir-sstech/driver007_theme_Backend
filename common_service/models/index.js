
/* *********** START: List of tables from db "DEFAULTDB" ****************** */
const Company = require("./company/companyModel")
const CompanyDetail = require("./company/companyDetailModel");
const Account = require("./account/accountModel");
const Driver = require("./driver/driverModel");
const DriverLicenceDetail = require("./driver/driverLicenceDetailModel");
const DriverVehicles = require("./driver/driverVehicleModel");
const DriverVehicleDocs = require("./driver/driverVehicleDocsModel");
const DriverVehicleAttachment = require("./driver/driverVehicleAttachModel");
const Users = require("./user/userModel");
const Role = require("./user/roleModel");
const Permission = require("./user/permissionModel");
const RolePermission = require("./user/rolePermissionModel");
const FcmToken = require("./user/fcmModel");
const UserType = require("./user/userTypeModel");
const Token = require("./user/tokenModel");
const UserBankDetail = require("./user/userBankDetailModel");
const UserOtherBankDetail = require("./user/userOtherBankDetailModel");
const AddressBook = require("./addressBookModel");
const LicenceFields = require("./dynamic_fields/licenceFieldsModel");
const BankAccountFields = require("./dynamic_fields/bankFieldsModel");
const VehicleDocuments = require("./dynamic_fields/VehicleDocsModel");
const Country = require("./countryModel");
const State = require("./stateModel");
const City = require("./cityModel");
const Currency = require("./currencyModel");
const WeightUnits = require("./wightUnitsModel");
const AdminModules = require("./adminModulesModel");
const InputFieldTypes = require("./inputFieldTypeModel");
const VehicleCategory = require("./vehicle/vehicleCategoryModel");
const Vehicle = require("./vehicle/vehicleModel");
const package = require("./setting/packageModel");
const settingApi = require("./setting/apiSettingModel");
const settingEmail = require("./setting/emailSettingModel");
const emailTemplate = require("./setting/templateTypeModel");
const settingSmtp = require("./setting/smtpSettingModel");
const FareSetting = require("./setting/fareSettingModel");
const FareDetail = require("./setting/fareDetailSettingModel");
const FareCommission = require("./setting/commissionFareSettingModel");
const FareTax = require("./setting/taxFareSettingModel");
const admin = require("./logshub/adminActivityLogsModel");
const api = require("./logshub/appApiLogsModel");
const Brand = require("./brand/brandModel");
const PaymentSetting = require("./setting/paymentSettingModel")
const PaymentKeySetting = require("./setting/paymentKeySettingModel")
/* *********** END: List of tables from db "DEFAULTDB" ****************** */

/* *********** START: List of tables from db "JOB_MANAGEMENT" **************** */
const JobMaster = require("./job/jobMasterModel");
const JobAddress = require("./job/jobAddressModel");
const JobPackage = require("./job/jobPackageModel");
const Transaction = require("./job/transactionModel");
const JobCharge = require("./job/jobChargeModel");
/* *********** END: List of tables from db "JOB_MANAGEMENT" ****************** */

module.exports = {
    Account, Company, CompanyDetail, Driver, DriverLicenceDetail, DriverVehicles, DriverVehicleDocs, DriverVehicleAttachment, Users, Role, Permission, RolePermission, FcmToken, UserType, Token, UserBankDetail, UserOtherBankDetail, AddressBook, VehicleDocuments, Country, State, VehicleCategory, Vehicle,
    package, settingApi, settingEmail, emailTemplate, settingSmtp, FareSetting, FareDetail, FareCommission, FareTax, LicenceFields, BankAccountFields, WeightUnits, City, Currency, InputFieldTypes, AdminModules, admin, api, Brand,
    JobMaster, JobAddress, JobPackage, Transaction, PaymentSetting, PaymentKeySetting, JobCharge,
}