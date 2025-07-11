import React from 'react';
import styled from 'styled-components';
import Sidebar from '../../components/Sidebar/Sidebar';

const Container = styled.div`
  margin-left: 200px;
  padding: 220px;
  background: #636863;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 5px;
`;

const SubTitle = styled.p`
  color: #63b0c9;
  margin-bottom: 20px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  background: ${(props) => props.primary ? '#0099E5' : '#2F4F4F'};
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 300px;
`;

const Table = styled.table`
  width: 100%;
  background: #fff;
  border-collapse: collapse;
  margin-top: 20px;
`;

const TH = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid #eee;
  font-weight: 600;
`;

const TD = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
`;

const Row = styled.tr`
  &:hover {
    background: #f0f8ff;
  }
`;

export default function AdminUsers() {
  const users = [
    { id: 1, name: "Denise Barroso de Carvalho", role: "Administrador de Plataforma" },
    { id: 2, name: "Supervisor Testando Gestão de Usuários", role: "Administrador de Mail, Administrador de Chat" },
  ];

  return (
    <>
    <Sidebar />
    <Container>
      <Title>Gestão de usuários</Title>
      <SubTitle>Configure permissões, status e dados dos usuários na plataforma.</SubTitle>

      <TopBar>
        <SearchInput placeholder="Buscar usuários..." />
        <Actions>
          <Button>Filtrar</Button>
          <Button primary>Adicionar Usuário</Button>
        </Actions>
      </TopBar>

      <Table>
        <thead>
          <Row>
            <TH>Usuários</TH>
            <TH>Perfis de acesso</TH>
            <TH>Ações</TH>
          </Row>
        </thead>
        <tbody>
          {users.map(user => (
            <Row key={user.id}>
              <TD>{user.name}</TD>
              <TD>{user.role}</TD>
              <TD>
                <Button>Editar</Button>
                <Button>Remover</Button>
              </TD>
            </Row>
          ))}
        </tbody>
      </Table>
    </Container>
    </>
  );
}