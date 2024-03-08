import React from 'react'

const Checkmark = ({ style }) => {
  return (
    <svg
    className={style}
    id="Layer_1"
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    width={24}
    height={24}
    color="#04D36D"
>
  <defs>
    <style>
      {`.cls-6374f8d9b67f094e4896c627-1 {
        fill: none;
        stroke: currentColor;
        stroke-miterlimit: 10;
        display: inline;
      }`}
    </style>
  </defs>
  <circle className="cls-6374f8d9b67f094e4896c627-1" cx={12} cy={12} r={10.5} />
  <polyline className="cls-6374f8d9b67f094e4896c627-1" points="6.27 12 10.09 15.82 17.73 8.18" />
    </svg>

  )
}

export default Checkmark
