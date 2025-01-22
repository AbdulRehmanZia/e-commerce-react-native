import React from "react";
import { Text, View } from "react-native";

const EnhancedText = ({
  children,
  highlightWords = [],
  highlightStyle = {},
  numberHighlightStyle = {},
  textStyle = {},
}) => {
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const highlightText = (text) => {
    if (typeof text !== "string") {
      return text;
    }

    const numberPattern = /\b\d+(\.\d+)?\b/g;
    const customWordsPattern =
      highlightWords.length > 0
        ? new RegExp(
            highlightWords.map((word) => escapeRegExp(word)).join("|"),
            "gi"
          )
        : null;

    const parts = text.split(/(\b\d+(\.\d+)?\b|[^\s]+|\s+)/);

    return parts.map((part, index) => {
      if (numberPattern.test(part)) {
        return (
          <Text
            key={index}
            style={[textStyle, numberHighlightStyle || highlightStyle]}
          >
            {part}
          </Text>
        );
      } else if (customWordsPattern && customWordsPattern.test(part)) {
        return (
          <Text key={index} style={[textStyle, highlightStyle]}>
            {part}
          </Text>
        );
      } else {
        return (
          <Text key={index} style={textStyle}>
            {part}
          </Text>
        );
      }
    });
  };

  const renderChildren = (children) => {
    return React.Children.map(children, (child) => {
      if (typeof child === "string") {
        return highlightText(child);
      }
      if (React.isValidElement(child) && child.type === Text) {
        return React.cloneElement(child, {
          ...child.props,
          children: renderChildren(child.props.children),
        });
      }
      return child;
    });
  };

  return renderChildren(children);
};

export default EnhancedText;
