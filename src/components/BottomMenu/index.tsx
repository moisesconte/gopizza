import React from "react";

import { Container, Title, Notification, Quantity } from "./styles";

type Props = {
  title: string;
  color: string;
  notifications?: string | undefined;
};

export function BottomMenu({ title, color, notifications }: Props) {
  const noNotification = notifications === "0";

  return (
    <Container>
      <Title color={color}>{title}</Title>

      {notifications && (
        <Notification noNotifications={noNotification}>
          <Quantity noNotifications={noNotification}>{notifications}</Quantity>
        </Notification>
      )}
    </Container>
  );
}
