const { Company, User, CompanyUsers } = require("../models");

// Super-Admin services
const createCompanyBySuperAdmin = async (companyData) => {
  try {
    const adminID = companyData.AdminID;
    const user = await User.findOne({
      where: {
        UserID: adminID
      }
    });

    if (!user) {
      return {
        status: false,
        message: "AdminID does not exist in Users table"
      };
    }

    if (user.UserRole !== "Admin") {
      return {
        status: false,
        message: "Only Admin can own their company"
      };
    }

    const existingCompany = await Company.findOne({
      where: {
        AdminID: adminID
      }
    });

    if (existingCompany) {
      return {
        status: false,
        message: "This AdminID already has a company"
      };
    }

    const newCompany = await Company.create(companyData);

    return {
      status: true,
      message: "Company created successfully by SuperAdmin",
      data: newCompany
    };
  } catch (error) {
    return {
      status: false,
      message: "Create company failed",
      error: error?.toString(),
    };
  }
};

const updateCompanyBySuperAdmin = async (CompanyID, updatedData) => {
  try {
    const company = await Company.findByPk(CompanyID);

    if (!company) {
      return {
        status: false,
        message: "Company not found"
      };
    }

    if (updatedData.AdminID) {
      const user = await User.findByPk(updatedData.AdminID);
      if (!user) {
        return {
          status: false,
          message: "AdminID does not exist in Users table"
        };
      }
  
      if (user.UserRole != "Admin") {
        return {
          status: false,
          message: "SuperAdmin or Supervisor cannot be Admin of the company"
        };
      }
    }

    await company.update(updatedData);

    return {
      status: true,
      message: "Company updated successfully",
      data: company
    };
  } catch (error) {
    return {
      status: false,
      message: error.message || "Update company failed",
      error: error?.toString()
    };
  }
};

const deleteCompanyBySuperAdmin = async (CompanyID) => {
  try {
    const company = await Company.findByPk(CompanyID);

    if (!company) {
      return {
        status: false,
        message: "Company not found",
      };
    }

    // 1. Lấy danh sách tất cả CompanyUsers cho CompanyID đang cần xóa.
    const companyUsers = await CompanyUsers.findAll({ where: { CompanyID } });

    // 2. Với mỗi CompanyUser, xóa tất cả IndividualPermissions liên quan.
    for (const user of companyUsers) {
      await IndividualPermissions.destroy({ where: { CompanyUserID: user.CompanyUserID } });
    }

    // 3. Sau khi tất cả IndividualPermissions đã được xóa, xóa tất cả CompanyUsers.
    await CompanyUsers.destroy({ where: { CompanyID } });

    // 4. Cuối cùng, xóa công ty.
    await company.destroy();

    return {
      status: true,
      message: "Company deleted successfully",
    };

  } catch (error) {
    return {
      status: false,
      message: error.message || "Delete company failed",
      error: error?.toString(),
    };
  }
};

// Admin services
const createCompanyByAdmin = async (AdminID, companyData) => {
  try {
    const user = await User.findOne({
      where: {
        UserID: AdminID
      }
    });

    if (!user) {
      return {
        status: false,
        message: "AdminID does not exist in Users table"
      };
    }

    if (user.UserRole !== "Admin") {
      return {
        status: false,
        message: "Only Admin can create a company for themselves"
      };
    }

    const existingCompany = await Company.findOne({
      where: {
        AdminID: AdminID
      }
    });

    if (existingCompany) {
      return {
        status: false,
        message: "This AdminID already has a company"
      };
    }

    if (companyData.AdminID !== AdminID) {
      return {
        status: false,
        message: "You don't have permission to create company for another admin"
      };
    }

    companyData.AdminID = AdminID;
    const newCompany = await Company.create(companyData);

    return {
      status: true,
      message: "Company created successfully by Admin",
      data: newCompany
    };
  } catch (error) {
    return {
      status: false,
      message: "Create company failed",
      error: error?.toString(),
    };
  }
};

const updateCompanyByAdmin = async (AdminID, updatedData) => {
  try {
    const admin = await User.findByPk(AdminID);
    if (!admin || admin.UserRole !== "Admin") {
      return {
        status: false,
        message: "Unauthorized"
      };
    }

    const company = await Company.findByPk(admin.CompanyID);
    if (!company) {
      return {
        status: false,
        message: "Company not found"
      };
    }

    await company.update(updatedData);

    return {
      status: true,
      message: "Company updated successfully",
      data: company
    };
  } catch (error) {
    return {
      status: false,
      message: error.message || "Update company failed",
      error: error?.toString()
    };
  }
};

const deleteCompanyByAdmin = async (CompanyID, CurrentAdminID) => {
  try {
    const company = await Company.findByPk(CompanyID);

    if (!company) {
      return {
        status: false,
        message: "Company not found",
      };
    }

    // Check if the company's AdminID matches the ID of the current admin.
    if (company.AdminID !== CurrentAdminID) {
      return {
        status: false,
        message: "You can only delete your own company",
      };
    }

    await company.destroy();
    return {
      status: true,
      message: "Company deleted successfully",
    };

  } catch (error) {
    return {
      status: false,
      message: error.message || "Delete company failed",
      error: error?.toString(),
    };
  }
};

const getAllCompanies = async (adminID, numberOfCompanies) => {
  try {
    if (isNaN(numberOfCompanies) || numberOfCompanies < 0) {
      return { status: false, message: "Invalid number" };
    }

    const user = await User.findOne({
      where: {
        UserID: adminID
      }
    });

    if (!user) {
      return {
        status: false,
        message: "AdminID does not exist in Users table",
      };
    }

    if (user.UserRole !== "SuperAdmin" && user.UserRole !== "Admin") {
      return {
        status: false,
        message: "You are restricted from viewing the company list"
      };
    }

    // Nếu Superadmin thì không cần điều kiện (thấy full list company)
    // Nếu Admin thì cần điều kiện (chỉ xem đc company của admin đó)
    let condition = user.UserRole === "SuperAdmin" ? {} : { AdminID: adminID };
    
    const companies = await Company.findAll({
      where: condition,
      attributes: ['CompanyID', 'CompanyName'],  
      limit: numberOfCompanies 
    });

    if (companies.length === 0) {
      return { status: false, message: user.UserRole === "SuperAdmin" ? "No companies found" : "No companies found for the given AdminID." };
    }

    return {
      status: true,
      data: companies,
    };

  } catch (error) {
    return {
      status: false,
      message: error.message || "Failed to fetch companies",
      error: error?.toString(),
    };
  }
};


module.exports = {
  createCompanyBySuperAdmin,
  updateCompanyBySuperAdmin,
  deleteCompanyBySuperAdmin,
  getAllCompanies,

  createCompanyByAdmin,
  updateCompanyByAdmin,
  deleteCompanyByAdmin
};
