"use client";

import { Fragment } from "react";
import Auth from "./Auth";
import PushRequest from "../PushRequest";
import ExtraUserDataListener from "./ExtraUserDataListener";
import InAppNotificationListener from "./InAppNotificationListener";
import SaveImageListener from "./SaveImageListener";
import Alert from "./Alert";
import AuthModal from "../modal/AuthModal";

const Init = () => {
  return (
    <Fragment>
      <Auth />
      <PushRequest />
      <ExtraUserDataListener />
      <InAppNotificationListener />
      <SaveImageListener />
      <Alert />
      <AuthModal />
    </Fragment>
  );
};

export default Init;
