"use client";

import { Fragment } from "react";
import Auth from "./Auth";
import PushRequest from "../PushRequest";
import ExtraUserDataListener from "./ExtraUserDataListener";
import InAppNotificationListener from "./InAppNotificationListener";

const Init = () => {
  return (
    <Fragment>
      <Auth />
      <PushRequest />
      <ExtraUserDataListener />
      <InAppNotificationListener />
    </Fragment>
  );
};

export default Init;
