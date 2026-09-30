import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { Drawer } from "antd";
import Header from "../../Components/Sidebar/Header";

const MainLayout = () => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <div className="fixed inset-y-0 left-0 z-30 hidden w-72 shadow-md lg:block">
        <Sidebar />
      </div>

      <Drawer
        placement="left"
        onClose={onClose}
        open={open}
        width={288}
        closable={false}
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <Sidebar closeDrawer={onClose} />
      </Drawer>

      <div className="min-h-screen lg:pl-72">
        <div className="fixed inset-x-0 top-0 z-20 border-b border-gray-200 bg-gray-50/95 backdrop-blur-sm lg:left-72">
          <div className="px-4 sm:px-6">
            <Header showDrawer={showDrawer} />
          </div>
        </div>

        <div className="min-w-0 overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
