import {
  Box,
  Input,
  Skeleton,
  Table, TableContainer,
  Tbody,
  Td, Text, Tfoot,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import withAuth from "../hoc/withAuth";
import { getAllRepos } from "../services/repositories.service";
import { RepositoryI } from "../types/repositories";

const Assets = () => {
  const [repositoryNameQuery, setRepositoryNameQuery] = useState("");
  const [repositoryIdQuery, setRepositoryIdQuery] = useState("");
  const [loadingRepositories, setLoadingRepositories] = useState(false);
  const [repositories, setRepositories] = useState<RepositoryI[]>([]);
  const navigate = useNavigate();

  const getRepositories = useCallback(async () => {
    setLoadingRepositories(true);
    const reposRes = await getAllRepos();
    setRepositories(reposRes);
    setLoadingRepositories(false);
  }, []);

  useEffect(() => {
    if (!loadingRepositories && repositories.length < 1) {
      getRepositories();
    }
  }, [getRepositories, loadingRepositories, repositories.length]);

  return (
    <Box>
      <Text padding={4} color="gray">Choose repository to export assets from</Text>
      <TableContainer opacity={loadingRepositories ? 0.5 : 1}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th isNumeric>#</Th>
              <Th>Repository</Th>
              <Th>ID</Th>
            </Tr>
            <Tr>
              <Th>-</Th>
              <Th>
                <Input
                  value={repositoryNameQuery}
                  onChange={(e) => setRepositoryNameQuery(e.target.value)}
                  placeholder="Repository name"
                  size="xs"
                />
              </Th>
              <Th>
                <Input
                  value={repositoryIdQuery}
                  onChange={(e) => setRepositoryIdQuery(e.target.value)}
                  placeholder="Repository id"
                  size="xs"
                />
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {loadingRepositories && (
              <Tr>
                <Td>
                  <Skeleton>1</Skeleton>
                </Td>
                <Td>
                  <Skeleton>1</Skeleton>
                </Td>
                <Td>
                  <Skeleton>1</Skeleton>
                </Td>
              </Tr>
            )}

            {repositories
              .filter(
                (repo) =>
                  repo.name.toLowerCase().includes(repositoryNameQuery.toLowerCase()) &&
                  repo.id.toLowerCase().includes(repositoryIdQuery.toLowerCase())
              )
              .map((repo, i) => {
                return (
                  <Tr
                    key={i}
                    cursor="pointer"
                    _hover={{
                      color: "blue.500",
                    }}
                    onClick={() => {
                      navigate({
                        pathname: "/repository",
                        search: `?id=${repo.id}&name=${repo.name}`,
                      });
                    }}
                  >
                    <Td>{i}</Td>
                    <Td>{repo.name}</Td>
                    <Td>{repo.id}</Td>
                  </Tr>
                );
              })}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>#</Th>
              <Th>Repository</Th>
              <Th isNumeric>ID</Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default withAuth(Assets);
