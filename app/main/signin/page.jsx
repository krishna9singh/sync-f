// Import necessary libraries and assets
"use client";
import Image from "next/image";
import bgg from "../../assets/mainbg.png";
import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { decryptaes, encryptaes } from "@/app/security";
import Cookies from "js-cookie";
import { userData } from "@/lib/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { API } from "@/utils/Essentials";
import { useAuthContext } from "@/utils/auth";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
// import firebase from "../../../firebase";

// // Define the functional component
function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [token, setToken] = useState({
    access_token: "",
    refresh_token: "",
  });
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [organization, setOrganization] = useState([]);
  const { setData } = useAuthContext();
  const [load, setLoad] = useState(false);
  const [loading,setLoading] = useState(false);

  const [popup, setPopup] = useState(false);

  const checklogin = async () => {
    try {
      setLoad(true);

      const response = await axios.post(`${API}/signin`, {
        email: email,
        pass: password,
        // org: organization,
      });
      console.log("next")
      if (response.data.success) {
        console.log("success")
        const details = response.data.user;

        if (response.data.organistions.length > 0) {
          setPopup(true);
          setOrganization(response.data.organistions);
          setData(response.data.data);
          setToken({
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
          });
          dispatch(
            userData({
              id: details._id,
              organization: details.organization,
              email: details.email,
            })
          );
        } else {
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 7);
          setData(response.data.data);
          Cookies.set("nexo-data-1", response.data?.access_token, {
            expires: expirationDate,
          });
          Cookies.set("nexo-data-2", response.data?.refresh_token, {
            expires: expirationDate,
          });

          router.push("../side/todo");
        }
      } else {
        console.log("fail")
        router.push("../main/signup");
      }
      console.log("su")
    } catch (e) {
      
      console.error("Error logging in", e.message);
    }
    setLoad(false);
  };

  const cookieSetter = async (id, title) => {
    setLoading(true);
    try {
    
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);
      Cookies.set("nexo-data-1", token.access_token, {
        expires: expirationDate,
      });
      Cookies.set("nexo-data-2", token.refresh_token, {
        expires: expirationDate,
      });

      localStorage.setItem("orgid", id);
      localStorage.setItem("orgtitle", title);
      router.push("../side/todo");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
     
   
  };
console.log(loading,"loadnsjknckj")
  return (
    <>
      {popup && (
        <div className="flex justify-center items-center h-screen fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 w-full">
          <div class=" p-4  max-w-md w-full z-50 max-h-full">
            <div class=" bg-[#FFF8EB] z-10 rounded-lg shadow ">
              <div class="flex items-center justify-between p-4 md:p-5 z-20 border-b rounded-xl">
                <h3 class="text-md  font-semibold text-gray-900">
                  Enter in Organization
                </h3>
              </div>

              <div class="p-4 md:p-5 space-y-4">
                {organization.map((d,i) => (
                  <div key={i} className="flex justify-between font-normal items-center px-3 text-[14px]">
                    <div>{d?.title}</div>
                    <div
                      onClick={() => cookieSetter(d?._id, d?.title)}
                      className="text-[14px] text-black  shadow-sm"
                    >
                      {loading ? (
                        <button className="rounded-xl bg-white  border border-[#E48700] border-opacity-25">
                          <div className="animate-spin px-3 py-1">
                        <AiOutlineLoading3Quarters />
                        </div>
                      </button>
             
            ) : (
                      <button className="rounded-xl bg-white hover:font-semibold px-3 py-1 border border-[#E48700] border-opacity-25">
                        Join
                      </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button
                  onClick={() => setPopup(false)}
                  data-modal-hide="default-modal"
                  type="button"
                  class="py-2.5 px-5 mx-auto text-sm font-medium text-white  bg-[#E48700] rounded-lg border hover: border-[#E48700] hover:bg-gray-100 hover:text-black focus:z-10 focus:ring-4  dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-screen font-sans h-screen bg-[#f9f9f9] sm:bg-[#FFC977] flex justify-center items-center">
        <div className="flex flex-row w-[80%] h-[80%] bg-white p-2 items-center justify-between rounded-3xl max-lg:justify-center">
          <div className="w-[50%] h-full flex items-center justify-center">
            <Image
              src={bgg}
              priority={true}
              alt="pic"
              className="pn:max-vs:hidden object-contain w-[600px] h-[600px]"
            />
          </div>
          <div className="h-[100%] w-[300px] vs:w-[400px] rounded-3xl bg-[#f9f9f9] flex flex-col justify-evenly items-center p-2">
            <div>
              <div className="text-[#3e3e3e] text-[24px] font-bold">Login!</div>
              <div className="h-[50px] w-[350px] items-center flex justify-between">
                <div className="text-[#3e3e3e] text-[20px] font-bold">
                  Welcome to Synchronous
                </div>
              </div>
              <div className="flex flex-col w-full">
                <div className="text-[14px] font-medium text-[#8D8D8D]">
                  New user ? Sign up today for exclusive access and benefits.
                </div>
                <Link
                  href={"/main/signup"}
                  className="text-[#ffbf67] hover:underline font-semibold text-[14px]"
                >
                  Sign Up Now
                </Link>
              </div>
            </div>

            {/* Enter your details */}
            <div className="h-[170px]  flex flex-col justify-between">
              {/* Organization name */}
              {/*  <div>
              <div className="text-[14px] font-sans font-semibold text-[#3e3e3e]">
                Organization
              </div>
              <input
                placeholder="Organization name"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="text-[#808080] bg-[#f9f9f9] my-2 text-[14px] px-2 flex justify-center items-center border-b-2 outline-none border-[#E48700] h-[40px] w-[350px]"
              />
            </div>*/}
              {/* Email */}
              <div>
                <div className="text-[14px] font-sans font-semibold text-[#3e3e3e]">
                Email address
                </div>
                <input
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-[#808080] bg-[#f9f9f9] my-2 text-[14px] px-2 flex justify-center items-center border-b-2 outline-none border-[#E48700] h-[40px] w-[350px]"
                />
              </div>
              {/* Password */}
              <div>
                <div className="text-[14px] font-sans font-semibold text-[#3e3e3e]">
                Password
                </div>
                <input
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-[#808080] bg-[#f9f9f9] my-2 text-[14px] px-2 flex justify-center items-center border-b-2 outline-none border-[#E48700] h-[40px] w-[350px]"
                />
              </div>
              {/* <div className="flex h-[40px] items-start w-[350px] justify-end">
                <div className="text-[#AD3113] text-[14px]">
                  Forgot Password?
                </div>
              </div> */}
            </div>

            {/* Sign In */}
            {load ? (
             <button className="rounded-full bg-[#e0a54c] border border-[#E48700] border-opacity-25">
             <div className="animate-spin px-[110px] py-2.5 text-white">
           <AiOutlineLoading3Quarters />
           </div>
         </button>

            ) : (
              <button
              disabled={email===""&& password===""}
                onClick={checklogin}
                className="bg-[#e0a54c] hover:bg-[#E48700] text-white font-bold text-[14px] flex justify-center items-center rounded-full py-2 shadow-lg w-[240px]"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
