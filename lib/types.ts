export interface Entry {
    id: string;
    text: string;
    title: string;
    image_url: string;
    is_favorite: boolean;
    tags: {
        id: string;
        name: string;
    }[];
    created_at: string;
}

export interface Tag {
    id: string;
    name: string;
}

export interface Profile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    updated_at: string | null;
}