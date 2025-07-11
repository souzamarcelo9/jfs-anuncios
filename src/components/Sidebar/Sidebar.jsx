// Sidebar.js
import React from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 220px;
  height: 100vh;
  background: #2F4F4F;
  color: #fff;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: 40px 20px;
`;

const Logo = styled.h2`
  margin-bottom: 40px;
`;

const NavItem = styled.a`
  margin: 15px 0;
  text-decoration: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

export default function Sidebar() {
  return (
    <SidebarContainer>
      <Logo>JFS Anúncios</Logo>
      <NavItem href="/dashboard">Dashboard</NavItem>
      <NavItem href="/promptModeler">Criar Anúncio</NavItem>
      <NavItem href="/">🔚 Voltar</NavItem>
    </SidebarContainer>
  );
}