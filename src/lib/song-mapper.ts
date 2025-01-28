interface JioSaavnSong {
  id: string;
  song?: string;
  title?: string;
  singers?: string;
  primary_artists?: string;
  image: string;
  media_url?: string;
  duration: string;
}

export const mapJioSaavnToAppFormat = (data: JioSaavnSong) => {
  return {
    id: data.id,
    name: data.song || data.title || '',
    primaryArtists: data.singers || data.primary_artists || '',
    image: [{
      quality: '500x500',
      link: data.image.replace('150x150', '500x500')
    }],
    downloadUrl: data.media_url ? [{
      quality: '320kbps',
      link: data.media_url
    }] : [],
    duration: parseInt(data.duration || '0')
  };
};
