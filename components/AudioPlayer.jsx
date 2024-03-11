"use client";

import React, { useRef, useState } from "react";
import { PlaySolid, PauseSolid } from "iconoir-react";
import { StrictMode } from "react";

const AudioPlayer = ({ src }) => {
  return(<audio src={src}></audio>
  );
};

export default AudioPlayer;
