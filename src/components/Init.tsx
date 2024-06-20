"use client";

import { Fragment } from "react";
import Auth from "./Auth";
import PushRequest from "./PushRequest";
import InAppNotificationListener from "./InAppNotificationListener";

const Init = () => {
  return (
    <Fragment>
      <Auth />
      <PushRequest />
      <InAppNotificationListener />
    </Fragment>
  );
};

export default Init;
