import React, { useEffect, useState } from "react";

import MainLayout from "~/ui/layout/main-layout";

import { useLeadStore } from "~/store";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { api } from "~/utils/api";
import LeadsLayout from "~/ui/layout/lead-layout";

type LeadsTimelineType = {
  id: string;
  date: Date;
  time: string;
};

type JSONObject = Record<string, string>;

function LeadsTimeline() {
  const emptyText = "empty";

  const { leadId } = useLeadStore();

  const { data: getLead } = api.lead.getLead.useQuery({ leadId });

  const [leadsData, setLeadsData] = useState<LeadsTimelineType[]>([]);
  const [leadTimelineData, setLeadTimelineData] = useState<
    Array<[string, string][]>
  >([]);
  const [leadCreatedAt, setLeadCreatedAt] = useState<Date[]>([]);

  const fetchInformation = () => {
    if (getLead?.lead.leadTimeline) {
      const accumulatedData: Array<[string, string][]> = [];
      const createdAtData: Date[] = [];

      getLead?.lead.leadTimeline.forEach((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const JSONObject: JSONObject = JSON.parse(item.changedInformation);
        const JSONObjectToArray = Object.entries(JSONObject);
        accumulatedData.push(JSONObjectToArray);

        const createdAt = new Date(item.createdAt);
        createdAtData.push(createdAt);
      });

      setLeadCreatedAt(createdAtData);
      setLeadTimelineData(accumulatedData);
    }
  };

  useEffect(() => {
    fetchInformation();
  }, [getLead]);

  const leadTimelineArrayOfObjects: JSONObject[] = leadTimelineData.map(
    (array) =>
      array.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as JSONObject),
  );

  useEffect(() => {
    const data = leadTimelineArrayOfObjects.map((value, index) => ({
      id: value.id || "",
      date: leadCreatedAt[index] || new Date(),
      time: leadCreatedAt[index]?.toLocaleTimeString() || "",
      key: index,
    }));

    // @ts-ignore
    setLeadsData(data);
  }, [getLead, leadTimelineData]);

  return (
    <MainLayout>
      <LeadsLayout>
        <div className="flex w-full items-center justify-center">
          {leadsData?.length > 0 ? (
            <VerticalTimeline
              lineColor="black"
              className="vertical-timeline-element--work"
            >
              {leadTimelineArrayOfObjects.map((value, index) => (
                <VerticalTimelineElement
                  key={index}
                  contentStyle={{ background: "#000", color: "#fff" }}
                  icon={
                    <svg
                      width="5"
                      height="5"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="4.5" cy="4.5" r="4.5" fill="#000" />
                      <circle cx="4.5" cy="4.5" r="3.5" fill="#fff" />
                      <circle cx="4.5" cy="4.5" r="1.5" fill="#000" />
                    </svg>
                  }
                >
                  <div className="flex flex-col justify-between gap-4">
                    <div className="text-black-1 flex justify-between">
                      <div>{leadCreatedAt[index]?.toDateString()}</div>
                      <div className="text-[10px] font-normal">
                        {leadCreatedAt[index]?.toTimeString()}
                      </div>
                    </div>
                    <div key={index} className="flex flex-col justify-between">
                      {Object.entries(value).map(([key, val]) => {
                        let formattedValue: JSX.Element | string = val;

                        if (val.includes(" to ")) {
                          const [beforeTo, afterTo] = val.split(" to ");
                          const formattedBeforeTo = val.startsWith(" to")
                            ? emptyText
                            : beforeTo === "undefined"
                            ? emptyText
                            : beforeTo;
                          formattedValue = (
                            <>
                              <span className="font-semibold text-white">{`${key}:`}</span>
                              <span className="text-black-1 font-semibold">
                                {formattedBeforeTo}
                              </span>
                              <span className="text-black-1"> to </span>
                              <span className="text-black-1 font-semibold">
                                {afterTo}
                              </span>
                            </>
                          );
                        } else {
                          formattedValue = (
                            <>
                              <span className="font-semibold text-white">{`${key}:`}</span>
                              <span className="text-black-1">
                                {formattedValue}
                              </span>
                            </>
                          );
                        }

                        return (
                          <div key={key} className="flex gap-1">
                            {formattedValue}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </VerticalTimelineElement>
              ))}
            </VerticalTimeline>
          ) : (
            <p className="flex h-full w-full items-center justify-center">
              No lead updates available
            </p>
          )}
        </div>
      </LeadsLayout>
    </MainLayout>
  );
}

export default LeadsTimeline;
