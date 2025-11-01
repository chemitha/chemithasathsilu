FROM nginx:alpine

# Copy your static files
COPY public /usr/share/nginx/html

# Copy the custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
