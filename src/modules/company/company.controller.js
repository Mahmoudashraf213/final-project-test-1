import xlsx from 'xlsx';
import moment from 'moment';
import { User,Company, Job, Application } from "../../../db/index.js";
import { ApiFeature } from "../../utils/apiFeatures.js";
import { AppError } from "../../utils/appError.js";
import { roles } from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";

// 1- Add company controller
export const addCompany = async (req, res, next) => {
  try {
    // Ensure the authenticated user has the role of Company_HR
    if (req.authUser.role !== "Company_HR") {
      return next(new AppError(messages.user.notAuthorized, 403));
    }

    // Extract data from request body
    let {
      companyName,
      description,
      industry,
      address,
      numberOfEmployees,
      companyEmail,
      companyHR,
      jobs, // Include jobs array from request
    } = req.body;

    // Convert companyName to lowercase
    companyName = companyName.toLowerCase();

    // Check if companyHR exists in the User collection
    const companyHRExist = await User.findById(companyHR);
    if (!companyHRExist) {
      return next(new AppError(messages.user.notFound, 404));
    }

    // Check if company with the same name or email already exists
    const companyExist = await Company.findOne({ companyName });
    const emailExist = await Company.findOne({ companyEmail });

    if (companyExist || emailExist) {
      return next(new AppError(messages.company.alreadyExist, 409));
    }

    // Prepare the company object
    const company = new Company({
      companyName,
      description,
      industry,
      address,
      numberOfEmployees,
      companyEmail,
      companyHR,
      jobs,
      createdBy: req.authUser._id,
    });

    // Save company to the database
    const createdCompany = await company.save();
    if (!createdCompany) {
      return next(new AppError(messages.company.failToCreate, 500));
    }


    // Send successful response
    return res.status(201).json({
      message: messages.company.createSuccessfully,
      success: true,
      data: createdCompany,
    });
  } catch (error) {
    return next(error);
  }
};


// 2- Update company function
export const updateCompany = async (req, res, next) => {
  const { companyId } = req.params; // Assuming the company ID is passed as a URL parameter
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
  } = req.body;

  // Find the company by ID
  const company = await Company.findById(companyId);
  if (!company) {
    return next(new AppError(messages.company.notFound, 404));
  }

  // Check if the authenticated user is the owner of the company
  if (company.companyHR.toString() !== req.authUser._id.toString()) {
    return next(new AppError(messages.user.notAuthorized, 403));
  }

  // Update the company details
  company.companyName = companyName ? companyName.toLowerCase() : company.companyName;
  company.description = description || company.description;
  company.industry = industry || company.industry;
  company.address = address || company.address;
  company.numberOfEmployees = numberOfEmployees || company.numberOfEmployees;
  company.companyEmail = companyEmail || company.companyEmail;

  // Save the updated company details
  const updatedCompany = await company.save();
  if (!updatedCompany) {
    return next(new AppError(messages.company.failToUpdate, 500));
  }

  // Send successful response
  return res.status(200).json({
    message: messages.company.updateSuccessfully,
    success: true,
    data: updatedCompany,
  });
};

// 3- Delete company data
export const deleteCompany = async (req, res, next) => {
  const { companyId } = req.params;

  // Validate companyId
  if (!companyId || companyId.length !== 24) {
    return next(new AppError('"companyId" must be a valid 24 character string', 400));
  }

  // Find the company by ID
  const company = await Company.findById(companyId);
  if (!company) {
    return next(new AppError(messages.company.notFound, 404));
  }

  // Check if the requesting user is the owner
  if (company.companyHR.toString() !== req.authUser._id.toString()) {
    return next(new AppError(messages.user.notAuthorized, 403));
  }

  // Proceed to delete the company
  await Company.findByIdAndDelete(companyId);

  await Job.deleteMany({companyId})
  // Send success response
  return res.status(200).json({
    message: messages.company.deleteSuccessfully,
    success: true,
  });
};

// 4- Get company data 
export const getCompanyData = async (req, res, next) => {
  const { companyId } = req.params;

  // Validate companyId
  if (!companyId) {
    return next(new AppError('Company ID is required', 400));
  }

  try {
    // Find the company by companyId
    const company = await Company.findById(companyId);
    if (!company) {
      return next(new AppError(messages.company.notFound, 404));
    }

    // Use ApiFeature to handle pagination and filtering
    const apiFeature = new ApiFeature(Job.find({ company: companyId }), req.query)
      .filter()
      .sort()
      .pagination();

    const jobs = await apiFeature.mongooseQuery;

    // Send successful response
    return res.status(200).json({
      message: messages.company.fetchedSuccessfully,
      success: true,
      data: {
        company,
        jobs,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// 5- Search Company by Name
export const searchCompany = async (req, res, next) => {
      const { companyName } = req.query;

      const companyExist = await Company.findOne({companyName: companyName.toLowerCase()})
      if (!companyExist) {
          return next(new AppError("Company not exist", 404));
      }

      // Create a Mongoose query to find companies by name
      // const query = Company.find({ companyName: { $regex: name, $options: 'i' } });

      // Initialize the ApiFeature class with the query and query parameters
      // const apiFeature = new ApiFeature(query, req.query);

      // Apply filtering, pagination, and sorting
      // const companies = await apiFeature.filter().sort().pagination().mongooseQuery;

      // if (companies.length === 0) {
      //     return res.status(404).json({
      //         success: false,
      //         message: messages.company.notFound,
      //         data: [],
      //     });
      // }

      return res.status(200).json({
          message:messages.company.fetchedSuccessfully,
          success: true,
          data: companyExist,
      });
  } 


// 6- Get all applications for a specific Job
export const getApplicationsForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.authUser._id

    const jobExists = await Job.findById(jobId).populate("companyId")
    if (!jobExists) {
      return next (new AppError(messages.user.notVerified,404))
      
    }
    // Ensure the user has the Company_HR role
    if (req.authUser.role !== roles.COMPANY_HR) {
      return next(new AppError("Unauthorized: Insufficient role", 403));
    }
    // if (!jobExists.companyId.companyHR.equals(userId)) {
    //   return next(new AppError(messages.user.notAuthorized,403))
    // }

    // Check if the job exists and is owned by the authenticated user (Company Owner)
    // const job = await Job.findOne({userId});
    // if (!job) {
    //   return next(new AppError("Job not found or not authorized", 404));
    // }

    // Find all applications for this specific job, and populate user data
    const applications = await Application.find({ jobId }).populate("userId", "firstName lastName email userTechSkills userSoftSkills userResume");

    if (applications.length === 0) {
        return next(new AppError("not exist",404))
      };
    // Return the applications with the populated user data
    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};



// 7- Collect applications for a specific company on a specific day and create an Excel sheet
export const getApplicationsReport = async (req, res, next) => {
  // get data from req
  const { companyId, date } = req.query;
  const userId = req.authUser._id;
  // Check if company exists
  const company = await Company.findById(companyId);
  if (!company) {
      return next(new AppError(messages.company.notExist, 404));
  }
  // check if the user is the owner of the company
  if (!company.companyHR.equals(userId)) {
      return next(new AppError(messages.user.unauthorized, 403));
  }
  // Fetch jobs for the company
  const jobs = await Job.find({ company: companyId });
  if (!jobs.length) {
      return next(new AppError(messages.job.notExist, 404));
  }

  // Get all jobIds for the company
  const jobIds = jobs.map(job => job._id);

  // Fetch applications for the company jobs on the specified day
  const applications = await Application.find({
      jobId: { $in: jobIds }, // Match any jobId from the company
      createdAt: {
          $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          $lte: new Date(new Date(date).setHours(23, 59, 59, 999))
      }
  }).populate('userId', 'firstName lastName email')
      .populate('jobId', 'jobTitle')
  // Check if there are applications
  if (!applications.length) {
      return next(new AppError('No applications found on the specified day', 404));
  }
  // Convert data into a format suitable for Excel
  const data = applications.map(application => ({
      'User Name': `${application.userId.firstName} ${application.userId.lastName}`,
      'Email': application.userId.email,
      'Applied Job Title': application.jobId.jobTitle,
      'Application Date': application.createdAt.toDateString(),
      'User Resume': application.userResume.secure_url
  }));
  // Create Excel file using xlsx library
  const worksheet = xlsx.utils.json_to_sheet(data); // Convert JSON data to a worksheet
  const workbook = xlsx.utils.book_new(); // Create a new workbook
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Applications'); // Append the worksheet to the workbook
  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=applications.xlsx');
  // Send the file
  const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.send(excelBuffer);
}