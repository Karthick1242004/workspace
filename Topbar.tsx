import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/assets/icons/logo_unilever.svg";
import SearchIcon from "@/assets/icons/search.svg";
import { useMsal } from "@azure/msal-react";
import { getUserProfile } from "@/utils/getUserProfile";
import { CircleHelp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspaceStore } from "@/@logic/workspaceStore";

export default function Topbar() {
  const [avatar, setAvatar] = useState<string>();
  const { accounts } = useMsal();
  const name = accounts[0]?.name;
  const userProfile = async () => {
    if (accounts.length > 0) {
      const userProfile = await getUserProfile(accounts[0]);
      setAvatar(userProfile);
    }
  };

  const setRoles = useWorkspaceStore((state) => state.setRoles);
  const adminRole = accounts[0].idTokenClaims?.roles;
  useEffect(() => {
    if (adminRole && Array.isArray(adminRole)) {
      setRoles(adminRole);
    }
  }, [adminRole, setRoles]); 

  useEffect(() => {
    userProfile();
  }, [accounts]);

  return (
    <div
      className="bg-[#F4FAFC] shadow-[rgba(99,99,99,0.2)_0px_2px_8px_0px] rounded-[15px]"
      style={{
        height: "var(--navbar-height)",
        boxShadow: "var(--shadow-default-nav)",
      }}
    >
      <div className="flex flex-row justify-between items-center py-2 px-6">
        <>
          <Link
            to="/workspace/my-workspace"
            className="flex flex-row gap-2 items-center font-unilever-medium"
          >
            <img src={Logo} alt="Uniliver Logo" className="h-[33px] w-[33px]" />
            <p className="text-[17px] bg-gradient-to-t from-[#1F36C7] to-[#697DFF] bg-clip-text text-transparent">
            AI Foundation Skill Builder
            </p>
          </Link>
        </>
        <div className="relative mr-40">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <img
              src={SearchIcon}
              alt="Search"
              className="h-5 w-5 text-gray-400"
            />
          </div>
          <input
            style={{
              border: "1.5px solid transparent",
              borderRadius: "8px",
              backgroundImage: `
              linear-gradient(white,white), 
              linear-gradient(to right, #FFC4D2, #9AF6F4)
            `,
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
            }}
            type="text"
            placeholder="Search Anything..."
            className="lg:w-[250%] md:w-[100%] h-[40px]  pl-10 font-unilever pr-3 py-2 rounded-[7px] border bg-white border-gray-200 text-[12px]"
          />
        </div>

        <div className="flex flex-row gap-4 items-center font-unilever px-2">
          <CircleHelp color="gray" size={35} className="p-1 cursor-pointer" />
          <div className="flex gap-2 items-center">
            <Avatar>
              <AvatarImage src={avatar} />
              <AvatarFallback className="bg-gray-600 text-white">
                {name
                  ? name.split(", ")
                    ? name.split(", ")[1][0]
                    : name.split(" ")[0][0]
                  : name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-unilever text-sm">{name}</p>
              <p className="text-gray-600 text-xs">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}