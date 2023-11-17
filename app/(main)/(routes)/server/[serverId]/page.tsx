import React from "react";

const ServerIdPage = ({ params }: { params: { serverId: string } }) => {
  return <div>page {params.serverId}</div>;
};

export default ServerIdPage;
