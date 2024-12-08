import { useState, useRef, useEffect } from "react";

export const useMount = (fn: Function) => {
  useEffect(() => {
    fn();
  }, []);
};

export const useUnMount = (fn: Function) => {
  useEffect(
    () => () => {
      fn();
    },
    []
  );
};

export const usePrevious = (state: any) => {
  const prevRef = useRef();
  const curRef = useRef();
  prevRef.current = curRef.current;
  curRef.current = state;
  return prevRef.current;
};
