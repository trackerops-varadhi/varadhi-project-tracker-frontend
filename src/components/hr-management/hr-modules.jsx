"use client";

import React, { useState } from "react";
import { 
  Users, 
  CalendarCheck, 
  UserCheck, 
  FileText, 
  FolderDown, 
  UserPlus, 
  Briefcase, 
  UsersRound, 
  UserX, 
  FolderKanban, 
  BarChart3, 
  User,
  X,
  Plus
} from "lucide-react";

export function HrModules() {
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employees, setEmployees] = useState([
    {
      employeeName: "Ananya Rao",
      dateOfJoining: "2023-06-15",
      role: "Project Manager",
      shiftTimings: "10:00 AM - 7:00 PM",
      emailAddress: "ananya.rao@varadhi.com",
      product: "Varadhi",
      gender: "Female",
      age: 28,
      maritalStatus: "Single",
      husbandFatherName: "Rao Venkata",
      permanentAddress: "H.No 12-4, Jubilee Hills, Hyderabad",
      temporaryAddress: "H.No 12-4, Jubilee Hills, Hyderabad",
      adhaarCard: "1234 5678 9012",
      educationQualification: "B.Tech (CSE)",
      collegeName: "JNTU Hyderabad",
      yearOfCompletion: 2021,
      coreSkill: "React, Node.js, Project Management",
      previousCompany: "TCS",
      totalExperience: "3 Years",
      dateOfResignation: "-",
      noOfYearsWorked: "2 Years 3 Months"
    },
    {
      employeeName: "Rahul Kumar",
      dateOfJoining: "2022-11-01",
      role: "Software Engineer",
      shiftTimings: "9:00 AM - 6:00 PM",
      emailAddress: "rahul.kumar@varadhi.com",
      product: "DeepFace",
      gender: "Male",
      age: 26,
      maritalStatus: "Single",
      husbandFatherName: "Satish Kumar",
      permanentAddress: "Flat 202, MG Road, Bangalore",
      temporaryAddress: "Flat 202, MG Road, Bangalore",
      adhaarCard: "9876 5432 1098",
      educationQualification: "B.E (ECE)",
      collegeName: "BMSCE Bangalore",
      yearOfCompletion: 2022,
      coreSkill: "Python, AI/ML, PyTorch",
      previousCompany: "Infosys",
      totalExperience: "2 Years",
      dateOfResignation: "-",
      noOfYearsWorked: "3 Years 10 Months"
    }
  ]);

  const [newEmp, setNewEmp] = useState({
    employeeName: "",
    dateOfJoining: "",
    role: "",
    shiftTimings: "",
    emailAddress: "",
    product: "",
    gender: "",
    age: "",
    maritalStatus: "",
    husbandFatherName: "",
    permanentAddress: "",
    temporaryAddress: "",
    adhaarCard: "",
    educationQualification: "",
    collegeName: "",
    yearOfCompletion: "",
    coreSkill: "",
    previousCompany: "",
    totalExperience: "",
    dateOfResignation: "-",
    noOfYearsWorked: ""
  });

  const modules = [
    { title: "Employee Details", subtitle: "HR Access", icon: Users, action: () => setIsEmployeeModalOpen(true) },
    { title: "Attendance", subtitle: "Team Access", icon: CalendarCheck },
    { title: "Leave Management", subtitle: "Team Access", icon: UserCheck },
    { title: "Daily Work Tracking", subtitle: "Team Access", icon: FileText },
    { title: "Resume Folder", subtitle: "HR Access", icon: FolderDown },
  
    { title: "Interview Management", subtitle: "HR Access", icon: Briefcase },
    { title: "Team List", subtitle: "Access to ALL", icon: UsersRound },
    { title: "Attrition Management", subtitle: "HR Access", icon: UserX },
    
 
   
  ];

  const handleAddEmployee = (e) => {
    e.preventDefault();
    setEmployees([...employees, newEmp]);
    setNewEmp({
      employeeName: "",
      dateOfJoining: "",
      role: "",
      shiftTimings: "",
      emailAddress: "",
      product: "",
      gender: "",
      age: "",
      maritalStatus: "",
      husbandFatherName: "",
      permanentAddress: "",
      temporaryAddress: "",
      adhaarCard: "",
      educationQualification: "",
      collegeName: "",
      yearOfCompletion: "",
      coreSkill: "",
      previousCompany: "",
      totalExperience: "",
      dateOfResignation: "-",
      noOfYearsWorked: ""
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">HR Modules</h3>
          <p className="text-xs text-gray-400">Open a detailed HR workspace</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod, index) => {
            const IconComponent = mod.icon;
            return (
              <div
                key={index}
                onClick={mod.action}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                  <IconComponent size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">{mod.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Employee Details Modal rendered inside the same file */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Employee Details (HR Access)</h2>
                <p className="text-xs text-gray-500">Comprehensive employee database matching organization spreadsheet records.</p>
              </div>
              <button 
                onClick={() => setIsEmployeeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Table view */}
            <div className="p-6 overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[1500px]">
                <thead>
                  <tr className="bg-indigo-50 text-indigo-900 text-xs uppercase font-semibold">
                    <th className="p-3 border border-indigo-100">Employee Name</th>
                    <th className="p-3 border border-indigo-100">Date of Joining</th>
                    <th className="p-3 border border-indigo-100">Role</th>
                    <th className="p-3 border border-indigo-100">Shift/Timings</th>
                    <th className="p-3 border border-indigo-100">Email Address</th>
                    <th className="p-3 border border-indigo-100">Product</th>
                    <th className="p-3 border border-indigo-100">Gender</th>
                    <th className="p-3 border border-indigo-100">Age</th>
                    <th className="p-3 border border-indigo-100">Marital Status</th>
                    <th className="p-3 border border-indigo-100">Husband/Father Name</th>
                    <th className="p-3 border border-indigo-100">Permanent Address</th>
                    <th className="p-3 border border-indigo-100">Temporary Address</th>
                    <th className="p-3 border border-indigo-100">Adhaar Card</th>
                    <th className="p-3 border border-indigo-100">Education Qualification</th>
                    <th className="p-3 border border-indigo-100">College Name</th>
                    <th className="p-3 border border-indigo-100">Year of Completion</th>
                    <th className="p-3 border border-indigo-100">Core Skill / Technical Knowledge</th>
                    <th className="p-3 border border-indigo-100">Previous Company</th>
                    <th className="p-3 border border-indigo-100">Total Experience</th>
                    <th className="p-3 border border-indigo-100">Date of Resignation</th>
                    <th className="p-3 border border-indigo-100">No of Years/Months worked in Varadhi</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-700">
                  {employees.map((emp, i) => (
                    <tr key={i} className="hover:bg-gray-50 border-b border-gray-100">
                      <td className="p-3 border border-gray-100 font-medium text-gray-900">{emp.employeeName}</td>
                      <td className="p-3 border border-gray-100">{emp.dateOfJoining}</td>
                      <td className="p-3 border border-gray-100">{emp.role}</td>
                      <td className="p-3 border border-gray-100">{emp.shiftTimings}</td>
                      <td className="p-3 border border-gray-100">{emp.emailAddress}</td>
                      <td className="p-3 border border-gray-100">{emp.product}</td>
                      <td className="p-3 border border-gray-100">{emp.gender}</td>
                      <td className="p-3 border border-gray-100">{emp.age}</td>
                      <td className="p-3 border border-gray-100">{emp.maritalStatus}</td>
                      <td className="p-3 border border-gray-100">{emp.husbandFatherName}</td>
                      <td className="p-3 border border-gray-100">{emp.permanentAddress}</td>
                      <td className="p-3 border border-gray-100">{emp.temporaryAddress}</td>
                      <td className="p-3 border border-gray-100">{emp.adhaarCard}</td>
                      <td className="p-3 border border-gray-100">{emp.educationQualification}</td>
                      <td className="p-3 border border-gray-100">{emp.collegeName}</td>
                      <td className="p-3 border border-gray-100">{emp.yearOfCompletion}</td>
                      <td className="p-3 border border-gray-100">{emp.coreSkill}</td>
                      <td className="p-3 border border-gray-100">{emp.previousCompany}</td>
                      <td className="p-3 border border-gray-100">{emp.totalExperience}</td>
                      <td className="p-3 border border-gray-100">{emp.dateOfResignation}</td>
                      <td className="p-3 border border-gray-100">{emp.noOfYearsWorked}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Quick Add Form Section */}
              <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Add New Employee Record</h4>
                <form onSubmit={handleAddEmployee} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <input 
                    type="text" placeholder="Employee Name" value={newEmp.employeeName} 
                    onChange={(e)=>setNewEmp({...newEmp, employeeName: e.target.value})}
                    className="p-2 bg-white border border-slate-200 rounded text-xs" required 
                  />
                  <input 
                    type="date" placeholder="Date of Joining" value={newEmp.dateOfJoining} 
                    onChange={(e)=>setNewEmp({...newEmp, dateOfJoining: e.target.value})}
                    className="p-2 bg-white border border-slate-200 rounded text-xs" required 
                  />
                  <input 
                    type="text" placeholder="Role" value={newEmp.role} 
                    onChange={(e)=>setNewEmp({...newEmp, role: e.target.value})}
                    className="p-2 bg-white border border-slate-200 rounded text-xs" 
                  />
                  <input 
                    type="text" placeholder="Email Address" value={newEmp.emailAddress} 
                    onChange={(e)=>setNewEmp({...newEmp, emailAddress: e.target.value})}
                    className="p-2 bg-white border border-slate-200 rounded text-xs" 
                  />
                  <input 
                    type="text" placeholder="Product" value={newEmp.product} 
                    onChange={(e)=>setNewEmp({...newEmp, product: e.target.value})}
                    className="p-2 bg-white border border-slate-200 rounded text-xs" 
                  />
                  <input 
                    type="text" placeholder="Core Skills" value={newEmp.coreSkill} 
                    onChange={(e)=>setNewEmp({...newEmp, coreSkill: e.target.value})}
                    className="p-2 bg-white border border-slate-200 rounded text-xs" 
                  />
                  <button type="submit" className="col-span-2 md:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold py-2 flex items-center justify-center gap-1">
                    <Plus size={14} /> Add Employee Record
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setIsEmployeeModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}