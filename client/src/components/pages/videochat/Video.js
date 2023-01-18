import React, { useRef, useEffect } from "react";

const Video = ({ mediaStream, width, title, playSound }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (mediaStream !== null) {
      videoRef.current.srcObject = mediaStream;
    } else if (videoRef.current.srcObject && mediaStream === null) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  }, [mediaStream]);

  return (
    <div>
      {playSound ? (
        <video width={width} autoPlay ref={videoRef} />
      ) : (
        <video width={width} autoPlay ref={videoRef} muted />
      )}

      <div>{title}</div>
    </div>
  );
};

export default Video;
