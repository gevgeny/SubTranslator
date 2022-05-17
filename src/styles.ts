// language=css
export const popupCss = `
  .sub-tr-popup {
    background: #262626;
    border-radius: 3px;
    position: fixed;
    overflow-y: scroll;
    overscroll-behavior: contain;
    z-index: 100000;
  }
  .sub-tr-popup::-webkit-scrollbar {
    width: 14px;
    height: 14px;
    background-color: transparent; /* or add it to the track */
  }
  .sub-tr-popup::-webkit-scrollbar-thumb {
    background: #aaa;
    border-radius: 8px;
    border: 4px solid transparent;
    background-clip: content-box;
  }
  
  .sub-tr-popup-content {
    padding: 16px;
    font-size: 14px;
  }
  
  .sub-tr-dict-item-text {
    font-weight: bolder;
  }
  
  .sub-tr-dict-item-ts {
    color: #b7b7b7;
  }
  
  .sub-tr-dict-item-pos {
    color: #50b772;
  }
  
  .sub-tr-dict-meaning {
    padding-left: 20px;
    margin-top: 8px;
    margin-bottom: 20px;
  }
  
  .sub-tr-dict-meaning-item {
    padding: 2px 4px;
    word-break: break-all;
  }
  
  .sub-tr-loading {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// language=css
export const spinnerCss = `
  .lds-spinner {
    color: official;
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  .lds-spinner div {
    transform-origin: 40px 40px;
    animation: lds-spinner 1.2s linear infinite;
  }
  .lds-spinner div:after {
    content: " ";
    display: block;
    position: absolute;
    top: 3px;
    left: 37px;
    width: 6px;
    height: 18px;
    border-radius: 20%;
    background: #fff;
  }
  .lds-spinner div:nth-child(1) {
    transform: rotate(0deg);
    animation-delay: -1.1s;
  }
  .lds-spinner div:nth-child(2) {
    transform: rotate(30deg);
    animation-delay: -1s;
  }
  .lds-spinner div:nth-child(3) {
    transform: rotate(60deg);
    animation-delay: -0.9s;
  }
  .lds-spinner div:nth-child(4) {
    transform: rotate(90deg);
    animation-delay: -0.8s;
  }
  .lds-spinner div:nth-child(5) {
    transform: rotate(120deg);
    animation-delay: -0.7s;
  }
  .lds-spinner div:nth-child(6) {
    transform: rotate(150deg);
    animation-delay: -0.6s;
  }
  .lds-spinner div:nth-child(7) {
    transform: rotate(180deg);
    animation-delay: -0.5s;
  }
  .lds-spinner div:nth-child(8) {
    transform: rotate(210deg);
    animation-delay: -0.4s;
  }
  .lds-spinner div:nth-child(9) {
    transform: rotate(240deg);
    animation-delay: -0.3s;
  }
  .lds-spinner div:nth-child(10) {
    transform: rotate(270deg);
    animation-delay: -0.2s;
  }
  .lds-spinner div:nth-child(11) {
    transform: rotate(300deg);
    animation-delay: -0.1s;
  }
  .lds-spinner div:nth-child(12) {
    transform: rotate(330deg);
    animation-delay: 0s;
  }
  @keyframes lds-spinner {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;