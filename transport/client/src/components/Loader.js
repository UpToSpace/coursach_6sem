import React from "react";
import loading from "../styles/images/loading2.gif"

const loaderCircle = () => {
  return (
    // <div className="preloader-wrapper big active">
    //   <div className="spinner-layer spinner-blue">
    //     <div className="circle-clipper left">
    //       <div className="circle"></div>
    //     </div><div className="gap-patch">
    //       <div className="circle"></div>
    //     </div><div className="circle-clipper right">
    //       <div className="circle"></div>
    //     </div>
    //   </div>

    //   <div className="spinner-layer spinner-red">
    //     <div className="circle-clipper left">
    //       <div className="circle"></div>
    //     </div><div className="gap-patch">
    //       <div className="circle"></div>
    //     </div><div className="circle-clipper right">
    //       <div className="circle"></div>
    //     </div>
    //   </div>

    //   <div className="spinner-layer spinner-yellow">
    //     <div className="circle-clipper left">
    //       <div className="circle"></div>
    //     </div><div className="gap-patch">
    //       <div className="circle"></div>
    //     </div><div className="circle-clipper right">
    //       <div className="circle"></div>
    //     </div>
    //   </div>

    //   <div className="spinner-layer spinner-green">
    //     <div className="circle-clipper left">
    //       <div className="circle"></div>
    //     </div><div className="gap-patch">
    //       <div className="circle"></div>
    //     </div><div className="circle-clipper right">
    //       <div className="circle"></div>
    //     </div>
    //   </div>
    // </div>
    <img src={loading} />
  )
}

export const Loader = () => (
  <div style={{
    position: 'fixed', height: '100%', width: '100%', textAlign: 'center', zIndex: '5',
    backgroundColor: "#0008", color: 'white', top: '0', left: '0', display: "flex", justifyContent: "center", alignItems: "center"
  }}>
    {loaderCircle()}
  </div>
)
