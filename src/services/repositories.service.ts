import axiosClient from "./api.service";
import { RepositoryI } from "../types/repositories";

export const getSingleRepoTest = async () => {
  const { data } = await axiosClient.get("/repositories?limit=1&totalResults=true");

  return data;
};

export const fetchAllRepos = async () => {
  const { data } = await axiosClient.get("/repositories?totalResults=true");

  return data;
};

export const getAllReposIDs = async (): Promise<string[]> => {
  const repos = await fetchAllRepos();
  return repos.items.map((repo: { id: string }) => repo.id);
};

export const getAllRepos = async (): Promise<RepositoryI[]> => {
  const repos = await fetchAllRepos();
  if (repos?.items) {
    return repos.items;
  }
  throw new Error("Error getting repositories");
};

export const getRepositoryIdByName = async (name: string) => {
  const repositories = await fetchAllRepos();
  const searchedRepository = repositories.items.find(
    (repository: { name: string }) => repository.name === name
  );

  return searchedRepository.id;
};
