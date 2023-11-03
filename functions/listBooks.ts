export const handler = async () => {
    return [
      {
        id: 123,
        title: "My Awesome Book",
        completed: true,
        rating: 10,
        reviews: ["The best book ever written"],
      },
      {
          id: 456,
          title: "My Second Awesome Book",
          completed: false,
          rating: 9,
          reviews: ["Also pretty good"],
      },
    ];
  };