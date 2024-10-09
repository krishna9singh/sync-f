"use client";
import React, { useCallback, useEffect, useState } from "react";
import pic from "../../../assets/empty.png";
import task from "../../../assets/task.png";
import redflag from "../../../assets/redflag.png";
import greenflag from "../../../assets/greenflag.png";
import { FaAngleDown } from "react-icons/fa6";
import Image from "next/image";
import TaskModal from "../../Compo/Addtask";
import TeamModal from "../../Compo/Addteamtask";
import { RiSearch2Line } from "react-icons/ri";
// import { MdKeyboardArrowDown } from "react-icons/md";
import axios from "axios";
import Cookies from "js-cookie";
import { decryptaes } from "@/app/security";
import { API } from "@/utils/Essentials";
import moment from "moment";
import { useAuthContext } from "@/utils/auth";
import { HiFlag } from "react-icons/hi";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

function page() {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamtasks, setTeamtasks] = useState(false);
  const [done, setDone] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [assignedtasks, setAssignedtasks] = useState([]);
  const [statusindex, setStatusindex] = useState(-1);
  const [load, setLoad] = useState("unload");
  const [initialload,setInitialload]=useState(true)
  const [click, setClick] = useState(false);
  const [search, setSearch] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [searchvalue, setSearchvalue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchResults1, setSearchResults1] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const url = process.env.NEXT_PUBLIC_URL;
  const { data } = useAuthContext();
  const id = data.id;
  const [isExpanded, setIsExpanded] = useState(false);
  const maxWords = 115;

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const [orgid, setOrgid] = useState("");
  useEffect(() => {
    const s = localStorage.getItem("orgid");
    setOrgid(s);
  }, []);

  const toggleText = () => {
    setIsExpanded(!isExpanded);
  };

  const renderText = (text) => {
    const words = text?.split("");
    if (words?.length <= maxWords) {
      return text;
    }
    return isExpanded ? text : words?.slice(0, maxWords).join("") + "...";
  };

  const close = () => {
    setTeamtasks(false);
  };

  const handleImageClick = async () => {
    try {
      setDone(!done);
      const res = await axios.post(`${API}/updatetask, {
        id,
        taskid,
        status: done ? "completed" : "pending",
      }`);
    } catch (error) {
      console.log(error);
    }
  };

  const getTasks = useCallback(async () => {
    try {
      setLoad("unload");
      const res = await axios.get(`${API}/fetchalltasks/${id}`);

      setTasks(res?.data?.tasks);
    } catch (error) {
      console.log(error);
    }
    setLoad("load");
  }, [id]);

  useEffect(() => {
    if (id) {
      getTasks();
    }
  }, [id]);

  const getassignedTasks = useCallback(async () => {
    try {
      setLoad("unload");
      const res = await axios.get(`${API}/fetchgettasks/${id}`);
      //console.log(res?.data, "assignedtasks");
      setAssignedtasks(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
    setLoad("load");
  }, [id]);

  useEffect(() => {
    if (id) {
      getassignedTasks();
    }
  }, [id]);

  const combinedTasks = [
    ...tasks.map((task) => ({
      ...task,
      type: "task",
      timestamp: task?.createdAt,
    })),
    ...assignedtasks.map((a) => ({
      ...a,
      type: "assignedtask",
      timestamp: a?.task?.assignedAt,
    })),
  ];

  

  combinedTasks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

 
  const handleSearchClick = () => {
    setSearch(!search);
  };
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchvalue(value);
    if (value) {
      const filteredResults1 = combinedTasks
        .filter((f) => f?.type === "task")
        .sort((a, b) => {
          return sortOrder === "newest"
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt);
        })
        .filter((item) =>
          item.text.toLowerCase().includes(value.toLowerCase())
        );

      setSearchResults1(filteredResults1);

      const filteredResults = combinedTasks
        .filter((f) => f?.type === "assignedtask")
        .sort((a, b) => {
          return sortOrder === "newest"
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt);
        })
        .filter((item) =>
          item?.task?.task.toLowerCase().includes(value.toLowerCase())
        );

      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
      setSearchResults1([]);
    }
    console.log("Search button clicked!");
  };

  return (
    <div className="font-sans h-[100%] scrollbar-hide flex flex-col justify-evenly items-center">
      {/* Tasks */}
      <div className="h-[100%] w-[100%] bg-[#EAEEF4] md:rounded-2xl flex overflow-hidden flex-col justify-between items-center object-contain">
        <div className=" px-2 pl-4 py-2 w-[100%] flex items-center ">
          {/* <div className="text-[14px] text-[#444444] font-semibold">
            Total: {tasks?.length || 0} tasks
          </div> */}
          <div className="flex justify-end ml-auto">
            {search ? (
              <div className=" flex row ">
                <div className="border border-yellow-500 rounded-lg w-80">
                  <input
                    type="text"
                    value={searchvalue}
                    className="placeholder:text-[12px] px-4 py-2 placeholder:font-serif outline:none focus:outline-none rounded-lg w-full"
                    placeholder="Search tasks...."
                    onChange={(e) => handleSearch(e)}
                  />
                </div>
                <button
                  onClick={() => setSearch(false)}
                  className=" mx-3 text-black"
                >
                  x
                </button>
              </div>
            ) : (
              <div
                onClick={handleSearchClick}
                className="bg-white w-8 h-8 rounded-full flex items-center justify-center mr-3 border border-[#EAEEF4]"
              >
                <RiSearch2Line className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* <div className=" bg-white rounded-3xl p-2 border border-[#EAEEF4]">
            <div className="flex items-center text-[13px] text-[#444444] font-medium">
              Sort by : Date
              <MdKeyboardArrowDown className="mt-1 ml-1" />
            </div>
          </div> */}
          <div
            className="bg-white rounded-3xl p-1 border border-[#EAEEF4] cursor-pointer"
            onClick={toggleDropdown}
          >
            <div className="flex relative items-center text-[13px] text-[#444444] font-medium px-2">
              Sort by : {sortOrder}
              {isDropdownOpen ? (
                <MdKeyboardArrowUp className="mt-1 ml-1" />
              ) : (
                <MdKeyboardArrowDown className="mt-1 ml-1" />
              )}
              {isDropdownOpen && (
                <div className="absolute bg-white top-7 rounded-lg shadow-lg w-full p-2 border border-[#EAEEF4]">
                  <div
                    onClick={() => {
                      setSortOrder("newest");
                      setDropdownOpen(false);
                    }}
                    className="py-1 hover:bg-gray-100 cursor-pointer"
                  >
                    Newest
                  </div>
                  <div
                    onClick={() => {
                      setSortOrder("oldest");
                      setDropdownOpen(false);
                    }}
                    className="py-1 hover:bg-gray-100 cursor-pointer"
                  >
                    Oldest
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-[100%] scrollbar-hide overflow-auto w-[100%] flex flex-col justify-start items-center">
       { load==="unload" ? (
                        <div >
                          Please wait while loading...
                        {/* <AiOutlineLoading3Quarters className="animate-spin h-[25px] w-[25px] self-center" /> */}
                       
                        </div>
                     ):(tasks?.length < 1 && assignedtasks.length < 1 ? (
                      <div className="h-full w-full flex flex-col justify-center items-center">
                        {/* for empty task */}
                        <Image src={pic} className="h-[300px] w-[300px]" />
                        <div className="flex flex-row items-center justify-between">
                          <Image src={task} className="h-[25px] w-[25px]" />
                          <div className="text-[18px] mx-2 text-[#444444] font-semibold">
                            No tasks found.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex w-full gap-2 flex-col">
                        <div className="w-full flex flex-col items-center py-2 justify-center gap-2">
                          {combinedTasks.filter((f) => f?.type === "task").length > 0 && (
                            <div className="w-[99%] items-center  justify-center gap-1   px-2 p-2 rounded-2xl bg-[#fff] flex flex-col">
                             {/* Name and dp */}
                              <div className=" w-full items-center justify-between  flex flex-row">
                                <div className="flex justify-center   items-center">
                                  <div className="h-[40px] w-[40px] rounded-full bg-yellow-500 ">
                                    <img
                                      // src={{ uri: item?.creator?.dp }}
                                      src={data?.dp}
                                      className="h-[40px] w-[40px] rounded-full bg-red-50 -ml-[3px] border-2 border-yellow-500 -mt-[3px]"
                                    />
                                  </div>
                                  <div className=" px-2  flex flex-col">
                                    <div className="font-bold font-sans text-[14px] text-black">
                                      By You
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="w-full flex flex-col    rounded-xl text-black">
                                <>
                                  {searchvalue ? (
                                    <>
                                      {" "}
                                      {searchResults1
                                        .filter((f) => f?.type === "task")
                                        .sort((a, b) => {
                                          return sortOrder === "newest"
                                            ? new Date(b.createdAt) -
                                                new Date(a.createdAt)
                                            : new Date(a.createdAt) -
                                                new Date(b.createdAt);
                                        })
                                        .map((items, ind) => {
                                          const formattedTimes = moment(
                                            items?.timestamp
                                          ).format("HH:mm");
                                          const formattedDays = moment(
                                            items?.timestamp
                                          ).format("dddd");
                                          const formattedDates = moment(
                                            items?.timestamp
                                          ).format("MMMM Do, YYYY");
          
                                          return (
                                            <div className="flex justify-between mt-2 bg-[#FFF8EB] rounded-xl w-full items-center">
                                              <div className="p-2">
                                                <div
                                                  style={{
                                                    overflowWrap: "break-word",
                                                    wordWrap: "break-word",
                                                    wordBreak: "break-word",
                                                  }}
                                                  className="text-[14px]  text-black "
                                                >
                                                  {ind + 1}){" "}
                                                  <span className="pl-1">
                                                    {renderText(items?.text)}
                                                  </span>
                                                </div>{" "}
                                                {/* <div className="text-[11px]  font-semibold px-4 text-[#414141]">
                                                  {moment(items.createdAt).fromNow()}
                                                </div> */}
                                              </div>
                                              <div className="flex flex-col justify-end  gap-2 items-end">
                                                <div className="flex-col items-center  flex justify-center gap-2">
                                                  <div className="text-[12px]  pn:max-sm:text-[10px] text-[#414141] ">
                                                    {/* {formattedTimes}, {formattedDates} */}
                                                    {moment(items.createdAt).fromNow()}
                                                  </div> 
                                                </div>
                                                {/* {items?.text?.split("")?.length > maxWords && (
                                              <button
                                                onClick={toggleText}
                                                className="text-blue-500   text-[12px] p-2  flex justify-center items-end"
                                              >
                                                {isExpanded ? "See less" : "See more"}
                                              </button>
                                            )} */}
          
                                                <div
                                                  onClick={() => {
                                                    handleImageClick({
                                                      taskid: items?.task?._id,
                                                      id: data.id,
                                                    });
                                                  }}
                                                  className=" object-contain relative text-[14px] px-2 text-green-600   flex items-center gap-2 text-center"
                                                >
                                                  {/* <div>{item?.task?.progress}</div> */}
                                                  {/* <FaAngleDown
                                              onClick={() => {
                                                setClick(!click);
                                                setStatusindex(index);
                                              }}
                                            /> */}
                                                  <HiFlag
                                                    className={`text-[18px]  ${
                                                      task?.progress === "Not Started"
                                                        ? "text-red-500"
                                                        : task?.progress === "In progress"
                                                        ? "text-yellow-500"
                                                        : "text-green-500"
                                                    }`}
                                                  />
                                                  {/* <div
                                                    className={`duration-100 ${
                                                      click === true &&
                                                      statusindex === ind
                                                        ? "h-auto w-auto text-[#474747] font-medium top-5 bg-white p-1 shadow-md rounded-lg absolute text-[14px] "
                                                        : "h-0 w-0 text-[0px] shadow-sm p-0"
                                                    }`}
                                                  >
                                                    <div
                                                      className={`${
                                                        click === true
                                                          ? "hover:bg-[#f8f8f8] rounded-lg py-1 duration-100 cursor-pointer"
                                                          : " py-0 duration-100 cursor-pointer px-0"
                                                      }`}
                                                    >
                                                      To do
                                                    </div>
                                                    <div
                                                      className={`${
                                                        click === true
                                                          ? "hover:bg-[#f8f8f8] rounded-lg py-1 duration-100 cursor-pointer px-2"
                                                          : "py-0 duration-100 cursor-pointer px-0"
                                                      }`}
                                                    >
                                                      In progress
                                                    </div>
                                                    <div
                                                      className={`${
                                                        click === true
                                                          ? "hover:bg-[#f8f8f8] rounded-lg py-1 duration-100 cursor-pointer px-2"
                                                          : " py-0 duration-100 cursor-pointer px-0"
                                                      }`}
                                                    >
                                                      Done{" "}
                                                    </div>
                                                  </div> */}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </>
                                  ) : (
                                    <>
                                      {combinedTasks
                                        .filter((f) => f?.type === "task")
                                        .sort((a, b) => {
                                          return sortOrder === "newest"
                                            ? new Date(b.createdAt) -
                                                new Date(a.createdAt)
                                            : new Date(a.createdAt) -
                                                new Date(b.createdAt);
                                        })
                                        .map((items, ind) => {
                                          const formattedTimes = moment(
                                            items?.timestamp
                                          ).format("HH:mm");
                                          const formattedDays = moment(
                                            items?.timestamp
                                          ).format("dddd");
                                          const formattedDates = moment(
                                            items?.timestamp
                                          ).format("MMMM Do, YYYY");
          
                                          return (
                                            <div className="flex justify-between mt-2 bg-[#FFF8EB] rounded-xl w-full items-center">
                                              <div className="p-2">
                                                <div
                                                  style={{
                                                    overflowWrap: "break-word",
                                                    wordWrap: "break-word",
                                                    wordBreak: "break-word",
                                                  }}
                                                  className="text-[14px]  text-black font-semibold "
                                                >
                                                  {ind + 1}){" "}
                                                  <span className="pl-1 font-normal">
                                                    {renderText(items?.text)}
                                                  </span>
                                                </div>{" "}
                                                {/* <div className="text-[11px] font-semibold px-4 text-[#414141]">
                                                  {moment(items.createdAt).fromNow()}
                                                </div> */}
                                              </div>
                                              <div className="flex flex-col justify-end gap-2 items-end">
                                                <div className="flex-col items-center  flex justify-center gap-2">
                                                  <div className="text-[12px] pn:max-sm:text-[10px] text-[#414141] mr-2">
                                                    {/* {formattedTimes}, {formattedDates} */}
                                                    {moment(items.createdAt).fromNow()}
                                                  </div>
                                                </div>
                                                {/* {items?.text?.split("")?.length > maxWords && (
                                            <button
                                              onClick={toggleText}
                                              className="text-blue-500   text-[12px] p-2  flex justify-center items-end"
                                            >
                                              {isExpanded ? "See less" : "See more"}
                                            </button>
                                          )} */}
          
                                                <div
                                                  onClick={() => {
                                                    handleImageClick({
                                                      taskid: items?.task?._id,
                                                      id: data.id,
                                                    });
                                                  }}
                                                  className=" object-contain relative text-[14px] px-2 text-green-600   flex items-center gap-2 text-center"
                                                >
                                                  {/* <div>{item?.task?.progress}</div> */}
                                                  {/* <FaAngleDown
                                            onClick={() => {
                                              setClick(!click);
                                              setStatusindex(index);
                                            }}
                                          /> */}
                                                  <HiFlag
                                                    className={`text-[18px]  ${
                                                      task?.progress === "Not Started"
                                                        ? "text-red-500"
                                                        : task?.progress === "In progress"
                                                        ? "text-yellow-500"
                                                        : "text-green-500"
                                                    }`}
                                                  />
                                                  <div
                                                    className={`duration-100 ${
                                                      click === true &&
                                                      statusindex === ind
                                                        ? "h-auto w-auto text-[#474747] font-medium top-5 bg-white p-1 shadow-md rounded-lg absolute text-[14px] "
                                                        : "h-0 w-0 text-[0px] shadow-sm p-0"
                                                    }`}
                                                  >
                                                    <div
                                                      className={`${
                                                        click === true
                                                          ? "hover:bg-[#f8f8f8] rounded-lg py-1 duration-100 cursor-pointer"
                                                          : " py-0 duration-100 cursor-pointer px-0"
                                                      }`}
                                                    >
                                                      To do
                                                    </div>
                                                    <div
                                                      className={`${
                                                        click === true
                                                          ? "hover:bg-[#f8f8f8] rounded-lg py-1 duration-100 cursor-pointer px-2"
                                                          : "py-0 duration-100 cursor-pointer px-0"
                                                      }`}
                                                    >
                                                      In progress
                                                    </div>
                                                    <div
                                                      className={`${
                                                        click === true
                                                          ? "hover:bg-[#f8f8f8] rounded-lg py-1 duration-100 cursor-pointer px-2"
                                                          : " py-0 duration-100 cursor-pointer px-0"
                                                      }`}
                                                    >
                                                      Done{" "}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </>
                                  )}
                                </>
                              </div>
                            </div>
                          )}
                          {load === "load" ? (
                            <>
                              {searchvalue ? (
                                <>
                                  {searchResults
                                    .sort((a, b) => {
                                      return sortOrder === "newest"
                                        ? new Date(b.task?.assignedAt) -
                                            new Date(a.task?.assignedAt)
                                        : new Date(a.task?.assignedAt) -
                                            new Date(b.task?.assignedAt);
                                    })
                                    .map((item, index) => {
                                      const formattedTime = moment(item.timestamp).format(
                                        "HH:mm"
                                      );
                                      const formattedDay = moment(item.timestamp).format(
                                        "dddd"
                                      );
                                      const formattedDate = moment(item.timestamp).format(
                                        "MMMM Do, YYYY"
                                      );
          
                                      if (item.type === "assignedtask") {
                                        return (
                                          <div
                                            key={index}
                                            className="w-[99%] items-center justify-center gap-1 space-y-2 p-2 px-2 rounded-2xl bg-white flex flex-col"
                                          >
                                            <div className=" w-full items-center justify-between flex flex-row">
                                              <div className="flex justify-center items-center">
                                                <div className="h-[40px] w-[40px] rounded-full bg-yellow-500">
                                                  <img
                                                    src={url + item?.task?.assignedBy?.dp}
                                                    className="h-[40px] w-[40px] rounded-full bg-red-50 -ml-[3px] border-2 border-yellow-500 -mt-[3px]"
                                                  />
                                                </div>
                                                <div className=" px-2 flex flex-col">
                                                  <div className="font-bold font-sans text-[14px] text-black">
                                                    {item?.task?.assignedBy?._id === id
                                                      ? "For You"
                                                      : `By ${item?.task?.assignedBy?.name}`}{" "}
                                                    {item?.task?.assignedBy?._id === id
                                                      ? "for"
                                                      : `to`}{" "}
                                                    {item?.team?.teamname}
                                                  </div>
                                                  <div className="text-[14px] text-[#414141]">
                                                    {moment(
                                                      item?.task?.assignedAt
                                                    ).fromNow()}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex-col flex items-center justify-center gap-2">
                                                <div className="text-[12px] pn:max-sm:text-[10px] text-[#414141] ">
                                                  {formattedDay}, {formattedTime},{" "}
                                                  {formattedDate}
                                                </div>
                                                {/* <div className="text-[14px] text-[#414141] ">
                        {moment(item?.task?.assignedAt).fromNow()}
                      </div> */}
                                              </div>
                                            </div>
                                            <div className=" w-full flex flex-row bg-[#FFF8EB] rounded-xl justify-between w-full text-black">
                                              <div
                                                style={{
                                                  overflowWrap: "break-word",
                                                  wordWrap: "break-word",
                                                  wordBreak: "break-word",
                                                }}
                                                className="text-[14px] p-2 text-black "
                                              >
                                                {renderText(item?.task?.task)}
                                                {/* {item?.task?.task} */}
                                              </div>
                                              <div
                                                onClick={() => {
                                                  handleImageClick({
                                                    taskid: item?.task?._id,
                                                    id: data.id,
                                                  });
                                                }}
                                                className=" object-contain relative text-[14px] px-2 text-green-600   flex items-center gap-2 text-center"
                                              >
                                                {/* <div>{item?.task?.progress}</div> */}
                                                {/* <FaAngleDown
                            onClick={() => {
                              setClick(!click);
                              setStatusindex(index);
                            }}
                          /> */}
                                                <HiFlag
                                                  className={`text-[18px]  ${
                                                    task?.progress === "Not Started"
                                                      ? "text-red-500"
                                                      : task?.progress === "In progress"
                                                      ? "text-yellow-500"
                                                      : "text-green-500"
                                                  }`}
                                                />
                                                <div
                                                  className={`duration-100 ${
                                                    click === true &&
                                                    statusindex === index
                                                      ? "h-auto w-auto text-[#474747] font-medium top-5 bg-white p-1 shadow-md rounded-lg absolute text-[14px] "
                                                      : "h-0 w-0 text-[0px] shadow-sm p-0"
                                                  }`}
                                                >
                                                  <div
                                                    className={`${
                                                      click === true
                                                        ? "hover:bg-[#f8f8f8] rounded-lg py-1 duration-100 cursor-pointer"
                                                        : " py-0 duration-100 cursor-pointer px-0"
                                                    }`}
                                                  >
                                                    To do
                                                  </div>
                                                  <div
                                                    className={`${
                                                      click === true
                                                        ? "hover:bg-[#f8f8f8] rounded-lg py-1 duration-100 cursor-pointer px-2"
                                                        : "py-0 duration-100 cursor-pointer px-0"
                                                    }`}
                                                  >
                                                    In progress
                                                  </div>
                                                  <div
                                                    className={`${
                                                      click === true
                                                        ? "hover:bg-[#f8f8f8] rounded-lg py-1 duration-100 cursor-pointer px-2"
                                                        : " py-0 duration-100 cursor-pointer px-0"
                                                    }`}
                                                  >
                                                    Done{" "}
                                                  </div>
                                                </div>
                                              </div>
                                              {item?.task?.task.split("").length >
                                                maxWords && (
                                                <button
                                                  onClick={toggleText}
                                                  className="text-blue-500"
                                                >
                                                  {isExpanded ? "See less" : "See more"}
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                    })}
                                </>
                              ) : (
                                <>
                                  {combinedTasks
                                    .sort((a, b) => {
                                      return sortOrder === "newest"
                                        ? new Date(b.task?.assignedAt) -
                                            new Date(a.task?.assignedAt)
                                        : new Date(a.task?.assignedAt) -
                                            new Date(b.task?.assignedAt);
                                    })
                                    .map((item, index) => {
                                      const formattedTime = moment(item.timestamp).format(
                                        "HH:mm"
                                      );
                                      const formattedDay = moment(item.timestamp).format(
                                        "dddd"
                                      );
                                      const formattedDate = moment(item.timestamp).format(
                                        "MMMM Do, YYYY"
                                      );
          
                                      if (item.type === "assignedtask") {
                                        return (
                                          <div
                                            key={index}
                                            className="w-[99%] items-center justify-center gap-1 space-y-2 p-2 px-2 rounded-2xl bg-white flex flex-col"
                                          >
                                            <div className=" w-full items-center justify-between flex flex-row">
                                              <div className="flex justify-center items-center">
                                                <div className="h-[40px] w-[40px] rounded-full bg-yellow-500">
                                                  <img
                                                    src={url + item?.task?.assignedBy?.dp}
                                                    className="h-[40px] w-[40px] rounded-full bg-red-50 -ml-[3px] border-2 border-yellow-500 -mt-[3px]"
                                                  />
                                                </div>
                                                <div className=" px-2 flex flex-col ">
                                                  <div className="font-bold font-sans text-[14px] text-black">
                                                    {item?.task?.assignedBy?._id === id
                                                      ? "Assigned to"
                                                      : `By ${item?.task?.assignedBy?.name}`}{" "}
                                                    {item?.task?.assignedBy?._id === id
                                                      ? ""
                                                      : `to`}{" "}
                                                    {item?.team?.teamname}
                                                  </div>
                                                  <div className="text-[14px] text-[#414141]">
                                                    {moment(
                                                      item?.task?.assignedAt
                                                    ).fromNow()}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex-col flex items-center justify-center gap-2">
                                                <div className="text-[12px] pn:max-sm:text-[10px] text-[#414141] ">
                                                 {formattedTime},{" "}
                                                  {formattedDate}
                                                </div>
                                                {/* <div className="text-[14px] text-[#414141] ">
                        {moment(item?.task?.assignedAt).fromNow()}
                      </div> */}
                                              </div>
                                            </div>
                                            <div className=" w-full flex flex-row bg-[#FFF8EB] rounded-xl justify-between w-full text-black">
                                              <div
                                                style={{
                                                  overflowWrap: "break-word",
                                                  wordWrap: "break-word",
                                                  wordBreak: "break-word",
                                                }}
                                                className="text-[14px] p-2 text-black "
                                              >
                                                {renderText(item?.task?.task)}
                                                {/* {item?.task?.task} */}
                                              </div>
                                              <div
                                                onClick={() => {
                                                  handleImageClick({
                                                    taskid: item?.task?._id,
                                                    id: data.id,
                                                  });
                                                }}
                                                className=" object-contain relative text-[14px] px-2 text-green-600   flex items-center gap-2 text-center"
                                              >
                                                {/* <div>{item?.task?.progress}</div> */}
                                                {/* <FaAngleDown
                            onClick={() => {
                              setClick(!click);
                              setStatusindex(index);
                            }}
                          /> */}
                                                <HiFlag
                                                  className={`text-[18px]  ${
                                                    task?.progress === "Not Started"
                                                      ? "text-red-500"
                                                      : task?.progress === "In progress"
                                                      ? "text-yellow-500"
                                                      : "text-green-500"
                                                  }`}
                                                />
                                                <div
                                                  className={`duration-100 ${
                                                    click === true &&
                                                    statusindex === index
                                                      ? "h-auto w-auto text-[#474747] font-medium top-5 bg-white p-1 shadow-md rounded-lg absolute text-[14px] "
                                                      : "h-0 w-0 text-[0px] shadow-sm p-0"
                                                  }`}
                                                >
                                                  <div
                                                    className={`${
                                                      click === true
                                                        ? "hover:bg-[#f8f8f8] rounded-lg py-1 duration-100 cursor-pointer"
                                                        : " py-0 duration-100 cursor-pointer px-0"
                                                    }`}
                                                  >
                                                    To do
                                                  </div>
                                                  <div
                                                    className={`${
                                                      click === true
                                                        ? "hover:bg-[#f8f8f8] rounded-lg py-1 duration-100 cursor-pointer px-2"
                                                        : "py-0 duration-100 cursor-pointer px-0"
                                                    }`}
                                                  >
                                                    In progress
                                                  </div>
                                                  <div
                                                    className={`${
                                                      click === true
                                                        ? "hover:bg-[#f8f8f8] rounded-lg py-1 duration-100 cursor-pointer px-2"
                                                        : " py-0 duration-100 cursor-pointer px-0"
                                                    }`}
                                                  >
                                                    Done{" "}
                                                  </div>
                                                </div>
                                              </div>
                                              {item?.task?.task.split("").length >
                                                maxWords && (
                                                <button
                                                  onClick={toggleText}
                                                  className="text-blue-500"
                                                >
                                                  {isExpanded ? "See less" : "See more"}
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                    })}
                                </>
                              )}
                            </>
                          ) : (
                            <div className="flex flex-col w-[100%] justify-center items-center h-[90%]">
                              <div className="w-[98%] gap-2 justify-center p-2 rounded-2xl items-center bg-[#fff] animate-pulse flex flex-col">
                                {/* For each task */}
                                <div className=" w-full items-center justify-between flex flex-row">
                                  <div className="flex justify-center items-center">
                                    {/* dp  */}
                                    <div className="h-[40px] w-[40px] rounded-full bg-[#ededed] ">
                                      <div className="h-[40px] w-[40px] rounded-full bg-[#f1f1f1] -ml-[2px] border-2 border-[#ededed] -mt-[2px]" />
                                    </div>
                                    {/* name  */}
                                    <div className=" px-2 flex flex-col gap-2">
                                      <div className="font-bold font-sans text-[14px] h-1 px-16 rounded-full bg-[#f2f2f2] text-black"></div>
                                      <div className="text-[14px] text-[#414141] h-1 px-5 rounded-full bg-[#f2f2f2]"></div>
                                    </div>
                                  </div>
                                  <div className=" flex-col flex justify-center">
                                    {/* report changer */}
                                    <div className=" object-contain bg-[#f1f1f1] p-4 px-8 rounded-full flex items-start justify-center"></div>
                                  </div>
                                </div>
                                <div className="w-full flex flex-row bg-[#ededed] text-[#ededed] rounded-2xl ">
                                  <div
                                    style={{
                                      overflowWrap: "break-word",
                                      wordWrap: "break-word",
                                      wordBreak: "break-word",
                                    }}
                                    className="text-[14px] p-2  "
                                  >
                                    hi
                                  </div>
                                </div>
                              </div>
                              <div className="w-[98%] mt-4 items-center gap-2 justify-center p-2 rounded-2xl  bg-[#fff] animate-pulse flex flex-col">
                                {/* For each task */}
                                <div className=" w-full  items-center justify-between flex flex-row">
                                  <div className="flex justify-center items-center">
                                    {/* dp  */}
                                    <div className="h-[40px] w-[40px] rounded-full bg-[#ededed] ">
                                      <div className="h-[40px] w-[40px] rounded-full bg-[#f1f1f1] -ml-[2px] border-2 border-[#ededed] -mt-[2px]" />
                                    </div>
                                    {/* name  */}
                                    <div className=" px-2 flex flex-col gap-2">
                                      <div className="font-bold font-sans text-[14px] h-1 px-16 rounded-full bg-[#f2f2f2] text-black"></div>
                                      <div className="text-[14px] text-[#414141] h-1 px-5 rounded-full bg-[#f2f2f2]"></div>
                                    </div>
                                  </div>
                                  <div className=" flex-col flex justify-center">
                                    {/* report changer */}
                                    <div className=" object-contain bg-[#f1f1f1] p-4 px-8 rounded-full flex items-start justify-center"></div>
                                  </div>
                                </div>
                                <div className="w-full flex flex-row bg-[#ededed] text-[#ededed] rounded-2xl ">
                                  <div
                                    style={{
                                      overflowWrap: "break-word",
                                      wordWrap: "break-word",
                                      wordBreak: "break-word",
                                    }}
                                    className="text-[14px] p-2  "
                                  >
                                    hi
                                  </div>
                                </div>
                              </div>
                              <div className="w-[98%] mt-4 items-center gap-2 justify-center p-2 rounded-2xl  bg-[#fff] animate-pulse flex flex-col">
                                {/* For each task */}
                                <div className=" w-full  items-center justify-between flex flex-row">
                                  <div className="flex justify-center items-center">
                                    {/* dp  */}
                                    <div className="h-[40px] w-[40px] rounded-full bg-[#ededed] ">
                                      <div className="h-[40px] w-[40px] rounded-full bg-[#f1f1f1] -ml-[2px] border-2 border-[#ededed] -mt-[2px]" />
                                    </div>
                                    {/* name  */}
                                    <div className=" px-2 flex flex-col gap-2">
                                      <div className="font-bold font-sans text-[14px] h-1 px-16 rounded-full bg-[#f2f2f2] text-black"></div>
                                      <div className="text-[14px] text-[#414141] h-1 px-5 rounded-full bg-[#f2f2f2]"></div>
                                    </div>
                                  </div>
                                  <div className=" flex-col flex justify-center">
                                    {/* report changer */}
                                    <div className=" object-contain bg-[#f1f1f1] p-4 px-8 rounded-full flex items-start justify-center"></div>
                                  </div>
                                </div>
                                <div className="w-full flex flex-row bg-[#ededed] text-[#ededed] rounded-2xl ">
                                  <div
                                    style={{
                                      overflowWrap: "break-word",
                                      wordWrap: "break-word",
                                      wordBreak: "break-word",
                                    }}
                                    className="text-[14px] p-2  "
                                  >
                                    hi
                                  </div>
                                </div>
                              </div>
                              <div className="w-[98%] mt-4 items-center gap-2 justify-center p-2 rounded-2xl  bg-[#fff] animate-pulse flex flex-col">
                                {/* For each task */}
                                <div className=" w-full  items-center justify-between flex flex-row">
                                  <div className="flex justify-center items-center">
                                    {/* dp  */}
                                    <div className="h-[40px] w-[40px] rounded-full bg-[#ededed] ">
                                      <div className="h-[40px] w-[40px] rounded-full bg-[#f1f1f1] -ml-[2px] border-2 border-[#ededed] -mt-[2px]" />
                                    </div>
                                    {/* name  */}
                                    <div className=" px-2 flex flex-col gap-2">
                                      <div className="font-bold font-sans text-[14px] h-1 px-16 rounded-full bg-[#f2f2f2] text-black"></div>
                                      <div className="text-[14px] text-[#414141] h-1 px-5 rounded-full bg-[#f2f2f2]"></div>
                                    </div>
                                  </div>
                                  <div className=" flex-col flex justify-center">
                                    {/* report changer */}
                                    <div className=" object-contain bg-[#f1f1f1] p-4 px-8 rounded-full flex items-start justify-center"></div>
                                  </div>
                                </div>
                                <div className="w-full flex flex-row bg-[#ededed] text-[#ededed] rounded-2xl ">
                                  <div
                                    style={{
                                      overflowWrap: "break-word",
                                      wordWrap: "break-word",
                                      wordBreak: "break-word",
                                    }}
                                    className="text-[14px] p-2  "
                                  >
                                    hi
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
          
        </div>
      </div>
      {/* <TaskModal isOpen={isModalOpen} onClose={closeModal} /> */}
      <TeamModal isOpen={teamtasks} onClose={close} />
    </div>
  );
}

export default page;
