"use client";

import { Fragment } from "react";
import Auth from "./Auth";
import PushRequest from "../PushRequest";
import ExtraUserDataListener from "./ExtraUserDataListener";
import InAppNotificationListener from "./InAppNotificationListener";
import SaveImageListener from "./SaveImageListener";

const Init = () => {
  return (
    <Fragment>
      <Auth />
      <PushRequest />
      <ExtraUserDataListener />
      <InAppNotificationListener />
      <SaveImageListener />
    </Fragment>
  );
};

export default Init;
