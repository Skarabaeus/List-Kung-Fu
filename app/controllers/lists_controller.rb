class ListsController < ApplicationController
  
  respond_to :json, :js
  
  def index
    @lists = List.all
    respond_with(@lists)
  end

  def show
    @list = List.find(params[:id])
    respond_with(@list)
  end

  def new
    @list = List.new
    respond_with(@list)
  end

  def edit
    @list = List.find(params[:id])

    respond_to do |format|
      format.js
    end
  end

  def create
    @list = List.new(params[:list])
    @list.owner = User.first #obviously this is just temporary.

    if @list.save
      flash[:notice] = 'List has been created.'
    end
    
    respond_with( @list )
  end

  def update
    @list = List.find(params[:id])
    if @list.update_attributes(params[:list])
      flash[:notice] = 'List has been updated.'
    end
    
    respond_with( @list )
  end

  def destroy
    @list = List.find( params[:id] )
    @list.destroy
    
    respond_with( @list )
  end
end
