"use client";

// import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import type { NextPage } from "next";
import { formatEther } from "viem";
// import { BookmarkIcon } from "@heroicons/react/24/outline";
import { Button } from "~~/components/ui/button";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
// import { formatWalletAddress } from "~~/lib/utils";
import { useGlobalState } from "~~/services/store/store";

// import { useAccount } from "wagmi";
// import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// import { Address } from "~~/components/scaffold-eth";

interface TService {
  id: bigint;
  address: string;
  amount: bigint;
  status: boolean;
  value: bigint;
  title: string;
  description: string;
  mediaLinks: string[];
}

const query = gql`
  {
    serviceCreateds {
      id
      ThreeLance_id
      price
      name
      description
      mediaLinks
    }
  }
`;
const url = "https://api.studio.thegraph.com/query/66219/threelance/version/latest";

const Home: NextPage = () => {
  // const { address: connectedAddress } = useAccount();
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const router = useRouter();
  const { data } = useScaffoldReadContract({
    contractName: "ThreeLance",
    functionName: "getAllServices",
    args: [1n, 3n], // passing args to function
  });
  const [gigs, setGigs] = useState<TService[] | undefined>([]);
  const { data: graphql_data } = useQuery({
    queryKey: ["servicesCreated"],
    async queryFn() {
      return await request(url, query);
    },
  });
  console.log("graph-ql: ", graphql_data);

  // const { data } = useScaffoldReadContract({
  //   contractName: "ThreeLance",
  //   functionName: "serviceCount",
  //   // args: [parseEther("1"), parseEther("3")], // passing args to function
  // });

  // console.log(data);
  useEffect(() => {
    if (data) {
      console.log(data);
      const transposedData = data[0]?.map((_, colIndex) => data.map(row => row[colIndex]));
      const dataObjects: TService[] = transposedData.map(item => ({
        id: item[0] as bigint,
        address: item[1] as string,
        amount: item[2] as bigint,
        status: item[3] as boolean,
        value: item[4] as bigint,
        title: item[5] as string,
        description: item[6] as string,
        mediaLinks: item[7] as any[],
      }));
      setGigs(dataObjects);
    }
  }, [data]);

  if (!data) {
    return <div>no data</div>;
  }

  return (
    <>
      {/* <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/app/page.tsx
            </code>
          </p>
          <p className="text-center text-lg">
            Edit your smart contract{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              YourContract.sol
            </code>{" "}
            in{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/hardhat/contracts
            </code>
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div> */}
      <h2 className="text-6xl font-bold my-8 text-center">All services</h2>
      <div className="flex gap-8 flex-wrap px-12">
        {gigs?.map((item, index) => (
          <Link href={`services/${item.id}`} key={index}>
            <div className="w-64 rounded-lg border transition duration-300 hover:shadow-xl shadow-md h-80 flex flex-col overflow-hidden">
              {/* <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">{formatWalletAddress(item.address)}</p>
                <Button className="flex gap-x-2 items-center" size="sm" variant="outline">
                  <span className="text-sm">Save</span>
                  <BookmarkIcon className="size-4 text-blue-black" />
                </Button>
              </div> */}
              <div className="relative w-full h-1/2">
                <Image
                  src="https://images.unsplash.com/photo-1664575197229-3bbebc281874?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  fill
                  alt="banner"
                  className="object-cover"
                />
              </div>
              <div className="p-2">
                <p className="text-xl font-bold">{item.title}</p>
                <p className="text-sm">{item.description}</p>
              </div>
              <div className="flex justify-between mt-auto border-t p-2">
                <p className="text-sm text-gray-500">
                  {formatEther(item.amount)} ETH ≃ ${Number(formatEther(item.amount)) * nativeCurrencyPrice}
                </p>
                <Button onClick={() => router.push(`/services/${item.id}`)}>View</Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default Home;
