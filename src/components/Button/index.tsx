import React from "react";
import { RectButtonProps } from "react-native-gesture-handler";
import { Container, Load, Title, TypeProps } from "./styles";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type Props = RectButtonProps & {
  title: string;
  type?: TypeProps;
  isLoading?: boolean;
};

export function Button({
  title,
  type = "primary",
  isLoading = false,
  ...rest
}: Props) {
  return (
    <GestureHandlerRootView>
      <Container type={type} enabled={!isLoading} {...rest}>
        {isLoading ? <Load /> : <Title>{title}</Title>}
      </Container>
    </GestureHandlerRootView>
  );
}
