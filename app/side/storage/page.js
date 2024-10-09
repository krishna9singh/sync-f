"use client";
import React, { useCallback, useEffect, useState } from "react";
// import assign from "../../assets/assign.png";
import upload from "../../assets/upload.png";
// import figma from "../../assets/figma.png";
// import file from "../../assets/file.png";
// import Dropdown from "../../assets/Dropdown.png";
// import gallery from "../../assets/gallery.png";
// import frame from "../../assets/frame.png";
// import Checkbox from "../../assets/Checkbox.png";
// import Search from "../../assets/Search.png";
import Image from "next/image";
import { MdDeleteOutline } from "react-icons/md";
import axios from "axios";
import { API } from "@/utils/Essentials";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import { decryptaes } from "@/app/security";
import moment from "moment";
import { useAuthContext } from "@/utils/auth";
import { RiSearch2Line } from "react-icons/ri";
import { LuSettings2 } from "react-icons/lu";
import { IoCloudUpload, IoCloudUploadOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { HiDownload } from "react-icons/hi";
import { RxCross2 } from "react-icons/rx";

function Page() {
  const { data } = useAuthContext();
  const orgType = useSelector((state) => state.user.type);
  // const orgid = data?.orgid?.[0];
  const [orgid, setOrgid] = useState("");
  const [dataa, setDataa] = useState([]);
  const [uploadpop, setUploadpop] = useState(false);
  const [filename, setFilename] = useState("");
  const [filestorage, setFilestorage] = useState("");
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [deletepop, setDeletepop] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchstorage = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/fetchstorage/${orgid}`);
      if (res.data.success) {
        setDataa(res.data.storage);
        console.log(res.data.storageused);
        setFilestorage(res.data.storageused);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [orgid]);

  const fetchstorageFromUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/fetchstorageuser/${data?.id}`);
      if (res.data.success) {
        setDataa(res.data.storage);
        console.log(res.data.storageused);
        setFilestorage(res.data.storageused);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [data?.id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFilename(file.name);
      uploadfile(file);
    }
  };

  useEffect(() => {
    const s = localStorage.getItem("orgid");
    setOrgid(s);
  }, []);

  const uploadfile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("id", data?.id);
      formData.append("orgid", orgid);

      const response = await axios.post(`${API}/uploadtostorage`, formData);
      if (response.status === 200) {
        if (orgType != "individual") {
          fetchstorage();
        } else {
          fetchstorageFromUser();
        }
        setUploadpop(false);
      } else {
        console.error("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handledel = async (o) => {
    setLoad(true);
    if (!data.id) {
      console.error("User ID is required but is null or undefined.");
      setLoad(false); // Reset loading state
      return; // Exit the function early
    }
    try {
      const res = await axios.post(`${API}/deleteitem`, {
        id: orgid,
        sid: o,
        userid: data.id,
      });

      if (res.data.success) {
        if (orgType != "individual") {
          fetchstorage();
        } else {
          fetchstorageFromUser();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoad(false); // Ensure loading state is reset in both success and error cases
    }
  };

  const handledownload = async (objectName) => {
    try {
      const response = await fetch(
        `${API}/downloadfile/?key=${encodeURIComponent(objectName)}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        setError("Failed to download file");
      }
    } catch (err) {
      setError("An error occurred while downloading the file");
    }
  };

  useEffect(() => {
    if (orgid) {
      fetchstorage();
    }
    const s = localStorage.getItem("orgid");
    if (!s) {
      fetchstorageFromUser();
    }
  }, [orgid, data?.id]);

  const truncatetext = (text, limit) => {
    return text.length <= limit ? text : text.slice(0, limit) + "...";
  };

  const convertFromBytes = (kilobytes) => {
    if (kilobytes >= 1024 * 1024)
      return (kilobytes / (1024 * 1024)).toFixed(2) + " GB";
    if (kilobytes >= 1024) return (kilobytes / 1024).toFixed(2) + " MB";
    if (kilobytes > 0) return kilobytes.toFixed(2) + " KB";
    return "0 KB";
  };

  const calculateWidthPercentage = (fileStorage) => {
    const limitInKB = 10 * 1024 * 1024; // 10 GB in KB
    const widthPercentage = (fileStorage / limitInKB) * 100;

    // Ensure width percentage does not exceed 100%
    return Math.min(widthPercentage, 100);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      const filteredResults = dataa.filter((item) =>
        item.filename.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="w-full px-2">
      <div className="h-[100%] w-full scrollbar-hide flex flex-col ">
        <div className="h-[60px] w-full py-2 flex flex-row pn:max-sm:flex-col items-center justify-between">
          <div className="h-[50px] w-[50%] bg-white mt-6 py-2 flex items-center px-2 text-[12px] rounded-2xl mb-6 text-[#BEBEBE]">
            <input
              type="text"
              placeholder="Search files"
              className="w-full bg-transparent outline-none px-1 text-black text-sm"
              value={searchTerm}
              onChange={handleSearch}
            />
            <RiSearch2Line className="text-black text-[20px] mr-2" />
          </div>
          {/* Storage used */}
          <div className="w-[45%] pn:max-sm:w-[100%] h-[50px] flex flex-col items-center justify-center">
            <div className="flex flex-row items-center  w-[100%]">
              <div className="px-2 w-full flex flex-col gap-1">
                <div className="text-sm text-[#615E83]">
                  <div className="flex flex-row items-center justify-between w-[100%]">
                    <div className="text-[#121212] font-bold text-[13px] ">
                      Storage used:
                    </div>
                    <div className="text-[#121212] text-[12px] ">
                      {convertFromBytes(filestorage)}
                    </div>
                    <div className="text-[#121212] text-[12px] w-[70%] justify-end flex">
                      10 GB
                    </div>
                  </div>
                </div>
                <div className="w-full h-3 mt-2 relative overflow-hidden min-w-[100px] bg-white rounded-full">
                  <div
                    style={{
                      width: `${calculateWidthPercentage(filestorage)}%`,
                    }}
                    className="absolute top-0 left-0 rounded-r-xl z-10 bg-[#08A0F7] h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="overflow-auto mt-2 text-[#5A5A5A] text-[14px] scrollbar-hide h-full bg-white rounded-lg w-[100%] flex flex-col items-center">
          {/* Header */}
          <div className="w-full h-[50px] flex flex-row px-2 justify-between items-center ">
            <div className=" h-[100%] flex justify-between items-center">
              <div className="text-[#1e1e1e] text-[14px] ml-4 font-semibold">
                Files uploaded
              </div>
            </div>
            <div className="space-x-3 h-[100%] flex flex-row items-center justify-evenly">
              {/* <div className="p-2 rounded-xl border-2 text-[12px] text-black font-semibold justify-center items-center">
                Download all
              </div> */}
              <div
                onClick={() => setUploadpop(true)}
                className="p-2 mr-5 flex flex-row rounded-xl border-2 text-[12px] text-white bg-[#FFC248] border-[#FFC248] justify-evenly items-center font-semibold"
              >
                <Image
                  src={upload}
                  alt="img"
                  className="h-[16px] w-[16px] object-contain"
                />
                <div className=" mx-2 pn:max-sm:hidden ">Upload</div>
              </div>
              {/* <div className="bg-white rounded-lg p-3 shadow-sm">
                <LuSettings2 />
              </div> */}
            </div>
          </div>

          {/* File List */}
          <div className="flex flex-row pn:max-sm:hidden w-[100%] h-[50px] items-center justify-evenly  font-bold">
            <div className="flex items-center sm:w-[30%] w-[60%] text-left ml-4">
              File Name
            </div>
            <div className="flex items-center sm:w-[20%] w-[20%] text-left">
              File Size
            </div>
            <div className="flex items-center sm:w-[20%] w-[20%] text-left">
              Date Uploaded
            </div>
            <div className="flex items-center sm:w-[20%] w-[20%] text-left">
              Uploaded By
            </div>
            <div className="flex items-center sm:w-[10%] w-[20%] text-left px-5">
              Actions
            </div>
          </div>

          {/* {dataa.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              No files uploaded
            </div>
          ) : ( */}
          <>
            {searchTerm ? (
              <>
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((d, i) => (
                      <div
                        key={i}
                        className={`flex flex-row ${
                          i % 2 === 0 ? "bg-[#EAECF0]" : "bg-white"
                        } justify-evenly items-center w-full border-b-[1px] border-gray-200 h-[50px] text-center px-4 text-[#1E1E1E] `}
                      >
                        <div className="sm:w-[30%] w-[60%] text-left">
                          {truncatetext(d.filename, 30)}
                        </div>
                        <div className="sm:w-[20%] w-[20%] text-left">
                          {convertFromBytes(d.size)}
                        </div>
                        <div className="sm:w-[20%] w-[20%] text-left">
                          {moment(d.createdAt).format("MMMM Do, YYYY")}
                        </div>
                        <div className="sm:w-[20%] w-[20%] text-left">
                          {d?.userid?.email}
                        </div>
                        <div className="sm:w-[10%] w-[20%] text-left">
                          <div
                            onClick={() => setDeletepop(false)}
                            className="flex flex-row space-x-3 items-center justify-center"
                          >
                            <MdDeleteOutline
                              className="text-[18px] cursor-pointer text-[#F13E3E]"
                              onClick={() => {
                                setSelectedId(d?._id);
                                setDeletepop(true);
                              }}
                            />
                            {console.log(d, "D")}
                            <div
                              className="text-[14px] cursor-pointer text-blue-600"
                              onClick={() => handledownload(d.objectName)}
                            >
                              <HiDownload />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>No Results</>
                )}
              </>
            ) : (
              <>
                {loading ? (
                  <div>Loading...</div>
                ) : dataa.length > 0 ? (
                  <>
                    {dataa.map((d, i) => (
                      <div
                        key={i}
                        className={`flex flex-row ${
                          i % 2 === 0 ? "bg-[#EAECF0]" : "bg-white"
                        } justify-evenly items-center w-full border-b-[1px] border-gray-200 h-[50px] text-center px-4 text-[#1E1E1E] `}
                      >
                        <div className="sm:w-[30%] w-[60%] text-left">
                          {truncatetext(d.filename, 30)}
                        </div>
                        <div className="sm:w-[20%] w-[20%] text-left">
                          {convertFromBytes(d.size)}
                        </div>
                        <div className="sm:w-[20%] w-[20%] text-left">
                          {moment(d.createdAt).format("MMMM Do, YYYY")}
                        </div>
                        <div className="sm:w-[20%] w-[20%] text-left">
                          {d?.userid?.email}
                        </div>
                        <div className="sm:w-[10%] w-[20%] text-left">
                          <div className="flex flex-row space-x-3 items-center justify-center">
                            <MdDeleteOutline
                              className="text-[18px] cursor-pointer text-[#F13E3E]"
                              onClick={() => {
                                setSelectedId(d?._id);
                                setDeletepop(true);
                              }}
                            />

                            <div
                              className="text-[14px] cursor-pointer text-blue-600"
                              onClick={() => handledownload(d.objectName)}
                            >
                              <HiDownload />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>No Results</>
                )}
              </>
            )}
          </>
          {/* )} */}
        </div>
        {/* Delete Popup */}
        {deletepop && (
          <div className="flex justify-center items-center h-screen fixed inset-0  z-40 backdrop-blur-sm bg-black bg-opacity-50 w-full">
            <div class=" p-4  max-w-md w-full z-50 max-h-full">
              <div class=" bg-white z-10 rounded-lg shadow ">
                <div class="flex items-center justify-between p-4 md:p-5 z-20 border-b rounded-xl">
                  <h3 class="text-md font-medium text-gray-900">
                    Are you sure you want to delete the file?
                  </h3>
                </div>

                {/* <div class="p-4 md:p-5 space-y-4">
                 {organization.map((d) => (
                   <div className="flex justify-between items-center px-3">
                     <div>{d?.title}</div>
                     <div
                       onClick={() => cookieSetter(d?._id, d?.title)}
                       className="text-[14px] text-blue-500 hover:text-black shadow-sm"
                     >
                       <button className="rounded-lg bg-[#FFF8EB] px-4 py-1 border border-gray-300">
                         Join
                       </button>
                     </div>
                   </div>
                 ))}
               </div> */}

                <div class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                  <button
                    onClick={() => {
                      handledel(selectedId);
                      setDeletepop(false);
                    }}
                    data-modal-hide="default-modal"
                    type="button"
                    class="py-2.5 px-5 mx-auto text-sm font-medium text-white focus:outline-none bg-[#E48700] rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-black focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setDeletepop(false)}
                    data-modal-hide="default-modal"
                    type="button"
                    class="py-2.5 px-5 mx-auto text-sm font-medium text-white focus:outline-none bg-[#E48700] rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-black focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Upload Popup */}
        {uploadpop && (
          <div className="fixed inset-0 bg-[#C0C0C0]/50 flex justify-center items-center">
            <div className="bg-[#FFF8EB] p-4 rounded-xl w-[30%]">
              <div className="flex justify-between">
                <h2 className="text-[15px] text-[#1E1E1E] font-semibold mb-2">
                  Upload File Here
                </h2>
                <RxCross2
                  onClick={() => setUploadpop(false)}
                  className="cursor-pointer text-[#F13E3E]"
                />
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl border border-2 w-full h-[150px] border-gray-200">
                <div className="flex flex-col items-center justify-center w-full h-full">
                  {filename ? (
                    <div className="text-[13px] flex-col flex justify-center items-center">
                      {/* <MdDriveFolderUpload className="text-[20px]"/> */}
                      <div>Uploading...</div>
                      <div>{filename}</div>
                    </div>
                  ) : (
                    <label
                      htmlFor="uploadfile"
                      className="w-full h-full flex items-center justify-center"
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <IoCloudUpload className="text-2xl text-gray-400" />
                      </div>
                    </label>
                  )}
                </div>
              </div>
              <input
                type="file"
                id="uploadfile"
                onChange={handleFileChange}
                className="w-full h-[100px] border rounded-md hidden px-2 bg-red-500"
              />

              <p className="text-gray-500 text-[12px] mt-2">
                Max 2 GB files are allowed
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
