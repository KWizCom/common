export type IMeetingLocationEntityType = "Custom" | "Default" | "ConferenceRoom" | "HomeAddress" | "BusinessAddress"
    | "GeoCoordinates" | "StreetAddress" | "Hotel" | "Restaurant" | "LocalBusiness" | "PostalAddress";

export interface IMeetingLocationAddress {
    Street: string;
    City: string;
    State: string;
    CountryOrRegion: string;
    PostalCode: string;
}

export interface IMeetingLocationCoordinates {
    Latitude: number;
    Longitude: number;
}

/** Represents location information of an event. 
 * Similar to https://learn.microsoft.com/en-us/graph/api/resources/location?view=graph-rest-1.0/ */
export interface IMeetingLocation {
    Address?: IMeetingLocationAddress,
    Coordinates?: IMeetingLocationCoordinates,
    DisplayName: string;
    EntityType: IMeetingLocationEntityType;
    IsPreviouslyUsed?: boolean;
    LocationSource?: string;
    LocationUri?: string;
    UniqueId?: string;
}