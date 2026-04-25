import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const FaceOvalMask = () => {
  const { height, width } = useWindowDimensions();
  
  // Make oval taller to give a face-like proportion
  const ovalWidth = width * 0.8;
  const ovalHeight = ovalWidth * 1.6;
  const cx = width / 2;
  const cy = height * 0.45; // Move oval up
  const rx = ovalWidth / 2;
  const ry = ovalHeight / 2;

  // Path for the outer rectangle
  const outerRectPath = `M0,0 H${width} V${height} H0 Z`;

  // Path for the inner ellipse (counter-clockwise)
  const innerEllipsePath = `M${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} Z`;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg height={height} width={width}>
        <Path
          d={`${outerRectPath} ${innerEllipsePath}`}
          fill="white" // Use fully white background
          fillRule="evenodd"
        />
      </Svg>
    </View>
  );
};

export default FaceOvalMask;
